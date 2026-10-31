import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

// TMDB accepts either a v4 Read Access Token (Bearer) or a v3 API key.
const getTmdbConfig = () => {
  const credential =
    process.env.TMDB_ACCESS_TOKEN ||
    process.env.TMDB_API_READ_ACCESS_TOKEN ||
    process.env.TMDB_API_KEY;

  if (!credential) {
    const error = new Error(
      "TMDB credentials are missing. Add TMDB_ACCESS_TOKEN (v4 Read Access Token) or TMDB_API_KEY (v3 API key) to the backend environment."
    );
    error.status = 500;
    throw error;
  }

  if (credential.startsWith("eyJ")) {
    return { headers: { Authorization: `Bearer ${credential}` } };
  }

  return { params: { api_key: credential } };
};

const tmdbGet = (path) =>
  axios.get(`https://api.themoviedb.org/3${path}`, {
    ...getTmdbConfig(),
    timeout: 20000,
  });

const sendError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error.response?.data || error.message);

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return res.status(504).json({
      success: false,
      message: "TMDB request timed out. Check the backend server's internet access and try again.",
    });
  }

  if (error.response) {
    return res.status(error.response.status).json({
      success: false,
      message:
        error.response.data?.status_message ||
        error.response.data?.message ||
        fallbackMessage,
    });
  }

  return res.status(error.status || 502).json({
    success: false,
    message: error.message || fallbackMessage,
  });
};

// Get currently playing movies from TMDB.
export const getNowPlayingMovies = async (req, res) => {
  try {
    const { data } = await tmdbGet("/movie/now_playing");
    return res.json({
      success: true,
      source: "tmdb",
      movies: Array.isArray(data.results) ? data.results : [],
      page: data.page || 1,
      total_pages: data.total_pages || 1,
    });
  } catch (error) {
    // If TMDB is temporarily unavailable or its key is misconfigured,
    // let admins schedule a movie that is already saved in MongoDB.
    console.error("TMDB now-playing request failed:", error.response?.data || error.message);
    try {
      const savedMovies = await Movie.find({})
        .sort({ createdAt: -1 })
        .limit(40)
        .lean();

      if (savedMovies.length > 0) {
        const movies = savedMovies.map((movie) => ({
          ...movie,
          id: Number(movie._id) || movie._id,
        }));
        return res.json({
          success: true,
          source: "database",
          warning: "TMDB is unavailable right now. Showing movies already saved in your database.",
          movies,
        });
      }
    } catch (dbError) {
      console.error("Could not load saved movies as fallback:", dbError.message);
    }

    return sendError(res, error, "Could not load movies from TMDB, and no saved movies are available as fallback.");
  }
};

// Save a movie and its selected showtimes in MongoDB.
export const addShow = async (req, res) => {
  try {
    const { movieId, showsInput, showPrice } = req.body || {};

    if (!movieId) {
      return res.status(400).json({ success: false, message: "Please select a movie." });
    }

    if (!Array.isArray(showsInput) || showsInput.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please add at least one show date and time.",
      });
    }

    const price = Number(showPrice);
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Show price must be a number greater than zero.",
      });
    }

    const movieKey = String(movieId);
    let movie = await Movie.findById(movieKey);

    if (!movie) {
      const [detailsResponse, creditsResponse] = await Promise.all([
        tmdbGet(`/movie/${encodeURIComponent(movieKey)}`),
        tmdbGet(`/movie/${encodeURIComponent(movieKey)}/credits`),
      ]);

      const details = detailsResponse.data;
      const movieDetails = {
        _id: movieKey,
        title: details.title || details.original_title || "Untitled movie",
        overview: details.overview || "",
        poster_path: details.poster_path || "",
        backdrop_path: details.backdrop_path || "",
        release_date: details.release_date || "",
        original_language: details.original_language || "",
        tagline: details.tagline || "",
        genres: Array.isArray(details.genres) ? details.genres : [],
        casts: Array.isArray(creditsResponse.data.cast)
          ? creditsResponse.data.cast
          : [],
        vote_average: Number(details.vote_average) || 0,
        runtime: Number(details.runtime) || 0,
      };

      movie = await Movie.create(movieDetails);
    }

    const now = new Date();
    const showsToCreate = [];

    for (const item of showsInput) {
      let showDateTime;

      if (item?.showDateTime) {
        showDateTime = new Date(item.showDateTime);
      } else if (item?.date && Array.isArray(item.time)) {
        for (const time of item.time) {
          const dateTime = new Date(`${item.date}T${time}:00`);
          if (Number.isNaN(dateTime.getTime()) || dateTime <= now) {
            return res.status(400).json({
              success: false,
              message: "Every showtime must be a valid future date and time.",
            });
          }
          showsToCreate.push({
            movie: movieKey,
            showDateTime: dateTime,
            showPrice: price,
            occupiedSeats: {},
          });
        }
        continue;
      }

      if (!showDateTime || Number.isNaN(showDateTime.getTime()) || showDateTime <= now) {
        return res.status(400).json({
          success: false,
          message: "Every showtime must be a valid future date and time.",
        });
      }

      showsToCreate.push({
        movie: movieKey,
        showDateTime,
        showPrice: price,
        occupiedSeats: {},
      });
    }

    if (showsToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid showtimes were provided.",
      });
    }

    const createdShows = await Show.insertMany(showsToCreate);

    return res.status(201).json({
      success: true,
      message: "Movie and showtimes saved successfully.",
      movieId: movie._id,
      showsCreated: createdShows.length,
    });
  } catch (error) {
    if (error.response || error.code === "ECONNABORTED" || error.code === "ETIMEDOUT" || error.status) {
      return sendError(res, error, "Could not add the show.");
    }

    console.error("Add show failed:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Could not save the show.",
    });
  }
};

// Get all movies that have upcoming shows.
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

// Get one movie and its upcoming showtimes.
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
