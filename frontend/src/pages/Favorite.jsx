import React, { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/react";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import MovieCard from "../components/MovieCard";
import BlurCircle from "../components/BlurCircle";
import Loading from "../components/Loading";
import { useApi } from "../library/api";

const Favorite = () => {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const { request } = useApi();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFavorites = async () => {
    try {
      const data = await request("/api/user/favorites");
      setMovies(data.movies || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    loadFavorites();
  }, [isSignedIn]);

  const removeFavorite = async (movieId) => {
    try {
      await request("/api/user/update-favorite", {
        method: "POST",
        body: JSON.stringify({ movieId }),
      });
      setMovies((current) => current.filter((movie) => movie._id !== movieId));
      toast.success("Removed from favorites");
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <main className="relative my-32 mb-48 min-h-[70vh] overflow-hidden px-6 md:px-16 lg:px-40 xl:px-44">
      <BlurCircle top="120px" left="0" />
      <div className="mb-8 flex items-center gap-3">
        <Heart className="h-6 w-6 fill-primary text-primary" />
        <div>
          <h1 className="text-2xl font-semibold">Your Favorites</h1>
          <p className="text-sm text-gray-400">Movies you have saved</p>
        </div>
      </div>

      {!isSignedIn ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="mb-4 text-gray-300">Sign in to view and manage your favorite movies.</p>
          <button onClick={() => openSignIn()} className="rounded-full bg-primary px-6 py-2">Sign in</button>
        </div>
      ) : error ? (
        <p role="alert" className="text-red-400">{error}</p>
      ) : movies.length ? (
        <div className="flex flex-wrap justify-center gap-6 md:justify-start">
          {movies.map((movie) => (
            <div key={movie._id} className="relative">
              <MovieCard movie={movie} />
              <button onClick={() => removeFavorite(movie._id)} aria-label="Remove favorite"
                className="absolute right-5 top-5 rounded-full bg-black/75 p-2 text-primary hover:bg-black">
                <Heart className="h-5 w-5 fill-current" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 py-16 text-center">
          <Heart className="mx-auto mb-4 h-10 w-10 text-gray-500" />
          <p className="text-lg font-medium">No favorite movies yet</p>
          <p className="mt-2 text-sm text-gray-400">Browse movies and save the ones you like.</p>
        </div>
      )}
    </main>
  );
};

export default Favorite;
