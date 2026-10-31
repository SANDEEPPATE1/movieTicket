import React, { useState } from "react";
import { StarIcon, Clock3, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClerk, useUser } from "@clerk/react";
import toast from "react-hot-toast";
import timeformat from "../library/timeformat";
import { useApi } from "../library/api";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const { request } = useApi();
  const [savingFavorite, setSavingFavorite] = useState(false);
  const movieId = movie?._id || movie?.id;
  const imagePath = movie?.backdrop_path || movie?.poster_path;
  const genres = Array.isArray(movie?.genres) ? movie.genres : [];
  const rating = Number(movie?.vote_average || 0);
  const releaseYear = movie?.release_date ? new Date(movie.release_date).getFullYear() : "Coming soon";

  const openMovie = () => {
    if (!movieId) return;
    navigate(`/movies/${movieId}`);
    window.scrollTo(0, 0);
  };

  const toggleFavorite = async () => {
    if (!isSignedIn) {
      openSignIn();
      return;
    }
    if (!movieId || savingFavorite) return;
    setSavingFavorite(true);
    try {
      const data = await request("/api/user/update-favorite", {
        method: "POST",
        body: JSON.stringify({ movieId: String(movieId) }),
      });
      toast.success(data.message || "Favorites updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSavingFavorite(false);
    }
  };

  return (
    <article className="relative flex w-full max-w-[270px] flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-[#17171b] p-3 transition duration-300 hover:-translate-y-1 hover:border-primary/40">
      <button type="button" onClick={toggleFavorite} disabled={savingFavorite}
        aria-label="Add or remove favorite" title="Add or remove favorite"
        className="absolute right-5 top-5 z-10 rounded-full bg-black/70 p-2 text-white transition hover:bg-primary disabled:opacity-50">
        <Heart className="h-4 w-4" />
      </button>
      <button type="button" onClick={openMovie} className="block w-full text-left">
        <img
          src={imagePath ? (imagePath.startsWith("http") ? imagePath : `https://image.tmdb.org/t/p/w500${imagePath}`) : "/placeholder.png"}
          alt={movie?.title || "Movie poster"}
          loading="lazy"
          className="h-52 w-full rounded-xl object-cover"
        />
        <h2 className="mt-3 truncate font-semibold text-white">{movie?.title || "Untitled movie"}</h2>
      </button>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
        <span>{releaseYear}</span><span>·</span>
        <span className="max-w-32 truncate">{genres.slice(0, 2).map((genre) => typeof genre === "string" ? genre : genre.name).filter(Boolean).join(" / ") || "Movie"}</span>
        {movie?.runtime > 0 && <><span>·</span><span className="flex items-center gap-1"><Clock3 className="h-3 w-3" />{timeformat(movie.runtime)}</span></>}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button type="button" onClick={openMovie} className="rounded-full bg-primary px-4 py-2.5 text-xs font-medium text-white transition hover:bg-primary-dull">View Details</button>
        <span className="flex items-center gap-1 text-sm text-gray-300"><StarIcon className="h-4 w-4 fill-primary text-primary" />{rating.toFixed(1)}</span>
      </div>
    </article>
  );
};

export default MovieCard;
