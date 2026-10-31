import React, { useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";
import Loading from "../components/Loading";
import { useApi } from "../library/api";

const Movies = () => {
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

  if (loading) return <Loading />;

  return (
    <div className="relative my-40 mb-60 min-h-[80vh] overflow-hidden px-6 md:px-16 lg:px-40 xl:px-44">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />
      <h1 className="my-4 text-lg font-medium">Now Showing</h1>
      {error && <p role="alert" className="mb-4 text-red-400">{error}</p>}
      {movies.length > 0 ? (
        <div className="flex flex-wrap gap-8 max-sm:justify-center">
          {movies.map((movie) => <MovieCard movie={movie} key={movie._id} />)}
        </div>
      ) : (
        <p className="mt-8 text-gray-400">No movies have upcoming shows yet.</p>
      )}
    </div>
  );
};

export default Movies;
