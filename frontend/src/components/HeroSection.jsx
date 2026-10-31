import React, { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, Clock3, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading";
import { useApi } from "../library/api";

const HeroSection = () => {
  const navigate = useNavigate();
  const { request } = useApi();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    request("/api/show/all")
      .then((data) => { if (active) setMovie(data.shows?.[0] || null); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <div className="flex min-h-[85vh] items-center justify-center"><Loading /></div>;

  const image = movie?.backdrop_path || movie?.poster_path;
  const imageUrl = image ? (image.startsWith("http") ? image : `https://image.tmdb.org/t/p/original${image}`) : "";

  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden px-6 pb-12 pt-32 md:px-16 lg:px-36"
      style={imageUrl ? { backgroundImage: `linear-gradient(90deg, rgba(9,9,11,.98) 0%, rgba(9,9,11,.78) 48%, rgba(9,9,11,.28) 100%), url(${imageUrl})`, backgroundPosition: "center", backgroundSize: "cover" } : { background: "linear-gradient(120deg,#17101b,#09090b 65%)" }}>
      <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-transparent to-black/20" />
      <div className="relative z-10 max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-primary">QuickShow · Now Showing</span>
        {movie ? (
          <>
            <h1 className="mt-7 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-7xl">{movie.title}</h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-primary text-primary"/>{Number(movie.vote_average || 0).toFixed(1)}</span>
              {movie.release_date && <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4"/>{new Date(movie.release_date).getFullYear()}</span>}
              {movie.runtime > 0 && <span className="flex items-center gap-1"><Clock3 className="h-4 w-4"/>{movie.runtime} min</span>}
              {(movie.genres || []).slice(0, 3).map((genre) => <span key={genre.id || genre.name} className="rounded-full border border-white/20 px-3 py-1">{genre.name || genre}</span>)}
            </div>
            <p className="mt-6 line-clamp-3 max-w-xl text-sm leading-7 text-gray-300 md:text-base">{movie.overview}</p>
            <button onClick={() => { navigate(`/movies/${movie._id}`); window.scrollTo(0, 0); }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-primary-dull">
              View Movie <ArrowRight className="h-4 w-4"/>
            </button>
          </>
        ) : (
          <>
            <h1 className="mt-7 text-5xl font-bold text-white md:text-7xl">Your next movie night starts here.</h1>
            <p className="mt-5 max-w-lg leading-7 text-gray-300">Discover movies and explore upcoming showtimes on QuickShow.</p>
            <button onClick={() => navigate("/movies")} className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold hover:bg-primary-dull">Explore Movies <ArrowRight size={17}/></button>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
