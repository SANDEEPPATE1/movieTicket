import React, { useEffect, useState } from "react";
import Loading from "../components/Loading";
import BlurCircle from "../components/BlurCircle";
import timeformat from "../library/timeformat";
import { dateformat } from "../library/dateformat";
import { useApi } from "../library/api";

const MyBookings = () => {
  const { request } = useApi();
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    request("/api/user/bookings")
      .then((data) => { if (active) setBookings(data.bookings || []); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="relative min-h-[80vh] px-6 pt-30 md:px-16 md:pt-40 lg:px-40">
      <BlurCircle top="100px" left="100px" />
      <h1 className="mb-4 text-lg font-semibold">My Bookings</h1>
      {error && <p role="alert" className="mb-4 text-red-400">{error}</p>}
      {bookings.map((item) => (
        <div key={item._id} className="mt-4 flex max-w-3xl flex-col justify-between rounded-lg border border-primary/20 bg-primary/8 p-2 md:flex-row">
          <div className="flex flex-col md:flex-row">
            <img src={item.show?.movie?.poster_path ? `https://image.tmdb.org/t/p/w500${item.show.movie.poster_path}` : "/placeholder.png"}
              alt={item.show?.movie?.title || "Movie"} className="h-36 object-cover md:max-w-45" />
            <div className="flex flex-col p-4">
              <p className="text-lg font-semibold">{item.show?.movie?.title || "Movie"}</p>
              <p className="text-sm text-gray-400">{timeformat(item.show?.movie?.runtime || 0)}</p>
              {item.show?.showDateTime && <p className="mt-auto text-sm text-gray-400">{dateformat(item.show.showDateTime)}</p>}
            </div>
          </div>
          <div className="flex flex-col justify-between p-4 md:items-end md:text-right">
            <p className="mb-3 text-2xl font-semibold">{currency}{item.amount}</p>
            <div className="text-sm">
              <p><span className="text-gray-400"><b>Total Tickets:</b> </span>{item.bookedSeats?.length || 0}</p>
              <p><span className="text-gray-400"><b>Seat Number:</b> </span>{item.bookedSeats?.join(", ")}</p>
              <p className={item.isPaid ? "text-green-400" : "text-amber-400"}>{item.isPaid ? "Paid" : "Payment pending"}</p>
            </div>
            {!item.isPaid && item.paymentLink && <a href={item.paymentLink} className="mt-3 rounded-full bg-primary px-4 py-2 text-center text-sm">Complete Payment</a>}
          </div>
        </div>
      ))}
      {bookings.length === 0 && !error && <p className="mt-8 text-gray-400">You have no bookings yet.</p>}
    </div>
  );
};

export default MyBookings;
