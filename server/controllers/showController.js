import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

// API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
  try {
    if (!process.env.TMDB_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "TMDB_API_KEY is missing from server environment variables.",
      });
    }

    const { data } = await axios.get(
      "https://api.themoviedb.org/3/movie/now_playing",
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        },
        timeout: 15000,
      }
    );

    return res.json({ success: true, movies: data.results || [] });
  } catch (error) {
    console.error("TMDB now-playing request failed:", error.message);
    return res.status(error.response?.status || 502).json({
      success: false,
      message: error.code === "ECONNABORTED"
        ? "TMDB request timed out. Please try again."
        : error.response?.data?.status_message || error.message,
    });
  }
};

// API to add a movie and its showtimes to MongoDB
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body;

    if (!movieId) {
      return res.status(400).json({ success: false, message: "movieId is required." });
    }

    if (!Array.isArray(showsInput) || showsInput.length === 0) {
      return res.status(400).json({ success: false, message: "Please select at least one show date and time." });
    }

    const price = Number(showPrice);
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ success: false, message: "Show price must be greater than zero." });
    }

    let movie = await Movie.findById(String(movieId));

    if (!movie) {
      if (!process.env.TMDB_API_KEY) {
        return res.status(500).json({ success: false, message: "TMDB_API_KEY is missing from server environment variables." });
      }

      // Use movieId (the request variable); movie_id was undefined here.
      const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
          timeout: 15000,
        }),
        axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
          headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
          timeout: 15000,
        }),
      ]);

      const movieApiData = movieDetailsResponse.data;
      const movieCreditsData = movieCreditsResponse.data;

      const movieDetails = {
        _id: String(movieId),
        title: movieApiData.title,
        overview: movieApiData.overview || "",
        poster_path: movieApiData.poster_path || "",
        backdrop_path: movieApiData.backdrop_path || "",
        genres: movieApiData.genres || [],
        casts: movieCreditsData.cast || [],
        release_date: movieApiData.release_date || "",
        original_language: movieApiData.original_language || "",
        tagline: movieApiData.tagline || "",
        vote_average: Number(movieApiData.vote_average) || 0,
        runtime: Number(movieApiData.runtime) || 0,
      };

      movie = await Movie.create(movieDetails);
    }

    const showsToCreate = [];
    for (const show of showsInput) {
      if (show.showDateTime) {
        const showDateTime = new Date(show.showDateTime);
        if (Number.isNaN(showDateTime.getTime()) || showDateTime <= new Date()) {
          return res.status(400).json({ success: false, message: "Every showtime must be a valid future date and time." });
        }
        showsToCreate.push({
          movie: String(movieId),
          showDateTime,
          showPrice: price,
          occupiedSeats: {},
        });
      } else if (show.date && Array.isArray(show.time)) {
        for (const time of show.time) {
          const showDateTime = new Date(`${show.date}T${time}:00`);
          if (Number.isNaN(showDateTime.getTime()) || showDateTime <= new Date()) {
            return res.status(400).json({ success: false, message: "Every showtime must be a valid future date and time." });
          }
          showsToCreate.push({
            movie: String(movieId),
            showDateTime,
            showPrice: price,
            occupiedSeats: {},
          });
        }
      }
    }

    if (showsToCreate.length === 0) {
      return res.status(400).json({ success: false, message: "No valid showtimes were provided." });
    }

    await Show.insertMany(showsToCreate);

    return res.status(201).json({
      success: true,
      message: "Movie and showtimes saved successfully.",
      movieId: movie._id,
      showsCreated: showsToCreate.length,
    });
  } catch (error) {
    console.error("Add show failed:", error);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.status_message || error.message,
    });
  }
};

// API to get all movies that have upcoming shows
export const getShows = async (req, res) => {
  try {
    const shows = await Show.find({ showDateTime: { $gte: new Date() } })
      .populate("movie")
      .sort({ showDateTime: 1 });

    const uniqueMovies = new Map();
    for (const show of shows) {
      if (show.movie) uniqueMovies.set(String(show.movie._id), show.movie);
    }

    return res.json({ success: true, shows: Array.from(uniqueMovies.values()) });
  } catch (error) {
    console.error("Get shows failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API to get one movie and its upcoming showtimes
export const getShow = async (req, res) => {
  try {
    const { movieId } = req.params;
    const [shows, movie] = await Promise.all([
      Show.find({
        movie: movieId,
        showDateTime: { $gte: new Date() },
      }).sort({ showDateTime: 1 }),
      Movie.findById(movieId),
    ]);

    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found." });
    }

    const dateTime = {};
    shows.forEach((show) => {
      const date = show.showDateTime.toISOString().split("T")[0];
      if (!dateTime[date]) dateTime[date] = [];
      dateTime[date].push({ time: show.showDateTime, showId: show._id });
    });

    return res.json({ success: true, movie, dateTime });
  } catch (error) {
    console.error("Get single show failed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
