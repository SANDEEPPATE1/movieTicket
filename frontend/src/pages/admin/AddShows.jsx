import React, { useEffect, useState } from "react";
import { CheckIcon, Trash2, StarIcon } from "lucide-react";
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

  useEffect(() => {
    let active = true;
    request("/api/show/now-playing")
      .then((data) => {
        if (active) setMovies(data.movies || []);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const handleDateTimeAdd = () => {
    if (!dateTimeInput) return;
    const [date, time] = dateTimeInput.split("T");
    if (!date || !time) return;
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
    const showsInput = Object.entries(dateTimeSelection).map(([date, time]) => ({ date, time }));
    if (!showsInput.length) return setError("Please add at least one show date and time.");

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
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div>
      <Title text1="Add" text2="Shows" />
      {error && <p role="alert" className="mt-4 rounded bg-red-500/10 p-3 text-red-400">{error}</p>}
      {message && <p role="status" className="mt-4 rounded bg-green-500/10 p-3 text-green-400">{message}</p>}

      <p className="mt-10 text-lg font-medium">Now Playing Movies</p>
      {movies.length === 0 ? (
        <p className="mt-4 text-gray-400">No movies were returned by TMDB.</p>
      ) : (
        <div className="mt-4 flex flex-wrap gap-4">
          {movies.map((movie) => (
            <button type="button" key={movie.id} onClick={() => setSelectedMovie(movie.id)}
              className={`relative w-36 text-left transition hover:-translate-y-1 ${selectedMovie === movie.id ? "opacity-100" : "opacity-80"}`}>
              <div className="relative overflow-hidden rounded-lg">
                <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.png"}
                  alt={movie.title} className="w-full object-cover" />
                <div className="absolute bottom-0 flex w-full items-center justify-between bg-black/70 p-2 text-xs">
                  <span className="flex items-center gap-1 text-gray-300"><StarIcon className="h-4 w-4 fill-primary text-primary" />{Number(movie.vote_average || 0).toFixed(1)}</span>
                  <span className="text-gray-300">{kConverter(movie.vote_count || 0)} votes</span>
                </div>
                {selectedMovie === movie.id && <span className="absolute right-2 top-2 rounded bg-primary p-1"><CheckIcon className="h-4 w-4 text-white" /></span>}
              </div>
              <p className="mt-2 truncate font-medium">{movie.title}</p>
              <p className="text-sm text-gray-400">{movie.release_date}</p>
            </button>
          ))}
        </div>
      )}

      <div className="mt-8">
        <label className="mb-2 block text-sm font-medium">Show Price</label>
        <input min="1" type="number" value={showPrice} onChange={(e) => setShowPrice(e.target.value)}
          placeholder="Enter show price" className="rounded-md border border-gray-600 bg-transparent px-3 py-2 outline-none" />
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium">Select Date & Time</label>
        <div className="flex flex-wrap gap-3">
          <input type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={dateTimeInput}
            onChange={(e) => setDateTimeInput(e.target.value)} className="rounded-md border border-gray-600 bg-transparent px-3 py-2" />
          <button type="button" onClick={handleDateTimeAdd} className="rounded-lg bg-primary px-4 py-2 text-white">Add Time</button>
        </div>
      </div>

      {Object.entries(dateTimeSelection).length > 0 && (
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
                      <button type="button" aria-label={`Remove ${date} ${time}`} onClick={() => handleRemoveTime(date, time)}>
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

      <button type="button" disabled={saving || loading || movies.length === 0} onClick={handleAddShow}
        className="mt-6 rounded bg-primary px-8 py-2 text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
        {saving ? "Saving..." : "Add Show"}
      </button>
    </div>
  );
};

export default AddShows;
