import React, { useCallback, useEffect, useState } from "react";
import { CheckIcon, Trash2, StarIcon, RefreshCw } from "lucide-react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title.jsx";
import { kConverter } from "../../library/kConverter";
import { useApi } from "../../library/api";

const AddShows = () => {
  const { request } = useApi();
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [dateTimeSelection, setDateTimeSelection] = useState({});
  const [showPrice, setShowPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sourceWarning, setSourceWarning] = useState("");

  const loadMovies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await request("/api/show/now-playing");
      setMovies(Array.isArray(data.movies) ? data.movies : []);
      setSourceWarning(data.warning || "");
    } catch (err) {
      setMovies([]);
      setSourceWarning("");
      setError(err.message || "Could not load movies.");
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) {
      setError("Please select a date and time first.");
      return;
    }

    const [date, time] = dateTimeInput.split("T");
    if (!date || !time || new Date(dateTimeInput) <= new Date()) {
      setError("Please choose a valid future date and time.");
      return;
    }

    setError("");
    setDateTimeSelection((prev) => {
      const times = prev[date] || [];
      return times.includes(time) ? prev : { ...prev, [date]: [...times, time] };
    });
    setDateTimeInput("");
  };

  const handleRemoveTime = (date, time) => {
    setDateTimeSelection((prev) => {
      const filtered = (prev[date] || []).filter((item) => item !== time);
      if (!filtered.length) {
        const { [date]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [date]: filtered };
    });
  };

  const handleAddShow = async () => {
    setError("");
    setMessage("");

    if (!selectedMovie) return setError("Please select a movie.");
    if (!Number.isFinite(Number(showPrice)) || Number(showPrice) <= 0) {
      return setError("Please enter a show price greater than zero.");
    }

    const showsInput = Object.entries(dateTimeSelection).flatMap(([date, times]) =>
      times.map((time) => ({
        showDateTime: new Date(`${date}T${time}`).toISOString(),
      }))
    );

    if (!showsInput.length) {
      return setError("Please add at least one show date and time.");
    }

    setSaving(true);
    try {
      const data = await request("/api/show/add", {
        method: "POST",
        body: JSON.stringify({
          movieId: selectedMovie,
          showsInput,
          showPrice: Number(showPrice),
        }),
      });
      setMessage(data.message || "Movie and showtimes saved successfully.");
      setDateTimeSelection({});
      setShowPrice("");
      setSelectedMovie(null);
    } catch (err) {
      setError(err.message || "Could not save the show.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pb-10">
      <Title text1="Add" text2="Shows" />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-medium">Now Playing Movies</p>
        <button
          type="button"
          onClick={loadMovies}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border border-gray-600 px-3 py-2 text-sm disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Retry loading
        </button>
      </div>

      {sourceWarning && (
        <p role="status" className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-200">{sourceWarning}</p>
      )}

      {error && (
        <div role="alert" className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
          {error.toLowerCase().includes("tmdb") && (
            <p className="mt-2 text-xs text-gray-300">
              Check the TMDB credential configured in the backend environment and confirm that the backend can reach api.themoviedb.org.
            </p>
          )}
        </div>
      )}
      {message && (
        <p role="status" className="mt-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-300">
          {message}
        </p>
      )}

      {loading ? (
        <div className="py-10"><Loading /></div>
      ) : movies.length === 0 ? (
        <p className="mt-5 rounded-lg border border-gray-700 p-5 text-sm text-gray-400">
          No movies are available right now. Check the error above and select Retry loading.
        </p>
      ) : (
        <div className="mt-5 flex flex-wrap gap-4">
          {movies.map((movie) => (
            <button
              type="button"
              key={movie.id}
              onClick={() => setSelectedMovie(movie.id)}
              aria-pressed={selectedMovie === movie.id}
              className={`relative w-36 text-left transition hover:-translate-y-1 ${selectedMovie === movie.id ? "opacity-100 ring-2 ring-primary rounded-lg" : "opacity-80"}`}
            >
              <div className="relative overflow-hidden rounded-lg">
                <img
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.png"}
                  alt={movie.title || "Movie poster"}
                  loading="lazy"
                  className="aspect-[2/3] w-full object-cover"
                />
                <div className="absolute bottom-0 flex w-full items-center justify-between bg-black/70 p-2 text-xs">
                  <span className="flex items-center gap-1 text-gray-300">
                    <StarIcon className="h-4 w-4 fill-primary text-primary" />
                    {Number(movie.vote_average || 0).toFixed(1)}
                  </span>
                  <span className="text-gray-300">{kConverter(movie.vote_count || 0)} votes</span>
                </div>
                {selectedMovie === movie.id && (
                  <span className="absolute right-2 top-2 rounded bg-primary p-1">
                    <CheckIcon className="h-4 w-4 text-white" />
                  </span>
                )}
              </div>
              <p className="mt-2 truncate font-medium">{movie.title}</p>
              <p className="text-sm text-gray-400">{movie.release_date || "Release date unavailable"}</p>
            </button>
          ))}
        </div>
      )}

      <div className="mt-8">
        <label htmlFor="show-price" className="mb-2 block text-sm font-medium">Show Price</label>
        <input
          id="show-price"
          min="1"
          type="number"
          value={showPrice}
          onChange={(event) => setShowPrice(event.target.value)}
          placeholder="Enter show price"
          className="rounded-md border border-gray-600 bg-transparent px-3 py-2 outline-none"
        />
      </div>

      <div className="mt-6">
        <label htmlFor="show-date-time" className="mb-2 block text-sm font-medium">Select Date &amp; Time</label>
        <div className="flex flex-wrap gap-3">
          <input
            id="show-date-time"
            type="datetime-local"
            min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
            value={dateTimeInput}
            onChange={(event) => setDateTimeInput(event.target.value)}
            className="rounded-md border border-gray-600 bg-transparent px-3 py-2"
          />
          <button
            type="button"
            onClick={handleDateTimeAdd}
            className="rounded-lg bg-primary px-4 py-2 text-white"
          >
            Add Time
          </button>
        </div>
      </div>

      {Object.keys(dateTimeSelection).length > 0 && (
        <div className="mt-6">
          <h2 className="font-medium">Selected Date-Time</h2>
          <ul className="mt-3 space-y-3">
            {Object.entries(dateTimeSelection).map(([date, times]) => (
              <li key={date}>
                <p>{date}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {times.map((time) => (
                    <span key={time} className="flex items-center gap-2 rounded border border-primary px-2 py-1 text-sm">
                      {time}
                      <button
                        type="button"
                        aria-label={`Remove ${date} ${time}`}
                        onClick={() => handleRemoveTime(date, time)}
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        disabled={saving || loading || movies.length === 0}
        onClick={handleAddShow}
        className="mt-6 rounded bg-primary px-8 py-2 text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Add Show"}
      </button>
    </div>
  );
};

export default AddShows;
