import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BlurCircle from "../components/BlurCircle";
import { PlayCircleIcon, StarIcon } from "lucide-react";
import timeformat from "../library/timeformat";
import DateSelect from "../components/DateSelect";
import MovieCard from "../components/MovieCard";
import Loading from "../components/Loading";
import { useApi } from "../library/api";

const MovieDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { request } = useApi();
  const [show, setShow] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setShow(null);
    setError("");
    request(`/api/show/${id}`)
      .then((data) => { if (active) setShow({ movie: data.movie, dateTime: data.dateTime || {} }); })
      .catch((err) => { if (active) setError(err.message); });
    return () => { active = false; };
  }, [id]);

  if (!show) return error ? <div className="min-h-[70vh] px-6 pt-40 text-center text-red-400">{error}</div> : <Loading />;

  const movie = show.movie;
  return (
    <div className="px-6 pt-30 md:px-16 md:pt-50 lg:px-40">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row">
        <img src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/placeholder.png"}
          alt={movie.title} className="h-104 max-w-70 rounded-xl object-cover max-md:mx-auto" />
        <div className="relative flex flex-col gap-3">
          <BlurCircle top="100px" left="100px" />
          <p className="text-primary">{(movie.original_language || "en").toUpperCase()}</p>
          <h1 className="max-w-96 text-4xl font-semibold text-balance">{movie.title}</h1>
          <div className="flex items-center gap-2 text-gray-300"><StarIcon className="h-5 w-5 fill-primary text-primary" />{Number(movie.vote_average || 0).toFixed(1)} User Rating</div>
          <p className="mt-2 max-w-xl text-sm leading-tight text-gray-400">{movie.overview}</p>
          <p>{timeformat(movie.runtime)} · {(movie.genres || []).map((genre) => genre.name).join(", ")} · {movie.release_date?.split("-")[0]}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${movie.title} official trailer`)}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md bg-gray-800 px-7 py-3 text-sm font-medium transition hover:bg-gray-900">
              <PlayCircleIcon className="h-5 w-5" />Find Trailer
            </a>
            <a href="#dateSelect" className="cursor-pointer rounded-md bg-primary px-10 py-3 text-sm font-medium transition hover:bg-primary-dull">Buy Tickets</a>
          </div>
        </div>
      </div>

      <p className="mt-20 text-lg font-medium">Cast</p>
      <div className="no-scrollbar mt-8 flex gap-4 overflow-x-auto pb-4">
        {(movie.casts || []).slice(0, 12).map((cast, index) => (
          <div key={cast.id || index} className="flex min-w-20 flex-col items-center text-center">
            <img src={cast.profile_path ? `https://image.tmdb.org/t/p/w185${cast.profile_path}` : "/placeholder.png"}
              alt={cast.name} className="aspect-square h-20 rounded-full object-cover" />
            <p className="mt-3 text-xs font-medium">{cast.name}</p>
          </div>
        ))}
      </div>

      {Object.keys(show.dateTime).length > 0 ? (
        <DateSelect dateTime={show.dateTime} id={id} />
      ) : <p className="mt-10 text-gray-400">No upcoming showtimes for this movie.</p>}

      <p className="mb-8 mt-20 text-lg font-medium">Back to Movies</p>
      <div className="mt-4 flex justify-center">
        <button onClick={() => { navigate("/movies"); window.scrollTo(0, 0); }}
          className="cursor-pointer rounded-md bg-primary px-10 py-3 text-sm font-medium transition hover:bg-primary-dull">Show more</button>
      </div>
    </div>
  );
};

export default MovieDetails;
