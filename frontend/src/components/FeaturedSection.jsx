import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BlurCircle from "./BlurCircle";
import MovieCard from "./MovieCard";
import Loading from "./Loading";
import { useApi } from "../library/api";

const FeaturedSection = () => {
  const navigate = useNavigate();
  const { request } = useApi();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    request("/api/show/all")
      .then((data) => { if (active) setMovies(data.shows || []); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return (
    <section className="overflow-hidden px-6 md:px-16 lg:px-24 xl:px-44">
      <div className="relative flex items-center justify-between pb-8 pt-20">
        <BlurCircle top="0" right="70px" />
        <div>
          <p className="text-lg font-medium text-gray-200">Now Showing</p>
          <p className="mt-1 text-sm text-gray-500">Movies with upcoming showtimes</p>
        </div>
        <button onClick={() => navigate("/movies")} className="group flex items-center gap-2 text-sm text-gray-300 hover:text-white">
          View All <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
        </button>
      </div>

      {loading ? <Loading /> : error ? (
        <p role="alert" className="py-8 text-center text-red-400">{error}</p>
      ) : movies.length ? (
        <div className="mt-4 flex flex-wrap justify-center gap-6 md:justify-start">
          {movies.slice(0, 4).map((movie) => <MovieCard key={movie._id} movie={movie} />)}
        </div>
      ) : (
        <p className="py-12 text-center text-gray-400">No upcoming shows yet. Please check again soon.</p>
      )}

      <div className="mt-14 flex justify-center">
        <button onClick={() => { navigate("/movies"); window.scrollTo(0, 0); }}
          className="rounded-full bg-primary px-10 py-3 text-sm font-medium transition hover:bg-primary-dull">
          Explore All Movies
        </button>
      </div>
    </section>
  );
};

export default FeaturedSection;
