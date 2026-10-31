import React, { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/react";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import timeformat from "../library/timeformat";
import { dateformat } from "../library/dateformat";
import { useApi } from "../library/api";

const MyBookings = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { openSignIn } = useClerk();
  const { request } = useApi();
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    if (!isLoaded) return () => { active = false; };
    if (!isSignedIn) {
      setBookings([]);
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    setError("");
    request("/api/user/bookings")
      .then((data) => { if (active) setBookings(data.bookings || []); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || loading) return <Loading />;

  return (
    <main className="relative min-h-[80vh] px-6 pb-20 pt-32 md:px-16 md:pt-40 lg:px-40">
      <BlurCircle top="100px" left="100px" />
      <h1 className="mb-2 text-2xl font-semibold">My Bookings</h1>
      <p className="mb-6 text-sm text-gray-400">View your ticket reservations and booking details.</p>

      {!isSignedIn ? (
        <section className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="mb-4 text-gray-300">Please sign in to see your bookings.</p>
          <button onClick={() => openSignIn()} className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white">Sign in</button>
        </section>
      ) : error ? (
        <section className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <p role="alert" className="text-red-400">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 rounded-full border border-white/20 px-5 py-2 text-sm hover:bg-white/5">Try again</button>
        </section>
      ) : bookings.length ? (
        <div className="space-y-4">
          {bookings.map((item) => (
            <article key={item._id} className="flex max-w-4xl flex-col justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-3 md:flex-row">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row">
                <img
                  src={item.show?.movie?.poster_path ? `https://image.tmdb.org/t/p/w500${item.show.movie.poster_path}` : "/placeholder.png"}
                  alt={item.show?.movie?.title || "Movie poster"}
                  className="h-40 w-28 rounded-lg object-cover"
                />
                <div className="flex flex-col justify-center gap-2">
                  <h2 className="text-lg font-semibold">{item.show?.movie?.title || "Movie unavailable"}</h2>
                  <p className="text-sm text-gray-400">{timeformat(item.show?.movie?.runtime || 0)}</p>
                  {item.show?.showDateTime && <p className="text-sm text-gray-400">{dateformat(item.show.showDateTime)}</p>}
                  <p className="text-sm text-gray-400">Seats: {item.bookedSeats?.join(", ") || "—"}</p>
                  <span className={item.isPaid ? "w-fit rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400" : "w-fit rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-400"}>
                    {item.isPaid ? "Paid" : "Payment pending"}
                  </span>
                </div>
              </div>
              <div className="flex flex-row items-center justify-between gap-4 border-t border-white/10 px-2 pt-3 md:flex-col md:items-end md:border-0 md:pt-2">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Booking amount</p>
                  <p className="text-2xl font-semibold">{currency}{Number(item.amount || 0).toLocaleString("en-IN")}</p>
                  <p className="mt-1 text-xs text-gray-400">{item.bookedSeats?.length || 0} ticket(s)</p>
                </div>
                {!item.isPaid && item.paymentLink && (
                  <a href={item.paymentLink} className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dull">Complete Payment</a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="rounded-xl border border-white/10 bg-white/5 py-16 text-center">
          <p className="text-lg font-medium">No bookings yet</p>
          <p className="mt-2 text-sm text-gray-400">Choose a movie and showtime to reserve your seats.</p>
          <Link to="/movies" className="mt-5 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white">Explore Movies</Link>
        </section>
      )}
    </main>
  );
};

export default MyBookings;
