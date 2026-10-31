import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title.jsx";
import { dateformat } from "../../library/dateformat";
import { useApi } from "../../library/api";

const ListBookings = () => {
  const { request } = useApi();
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    request("/api/admin/all-bookings")
      .then((data) => { if (active) setBookings(data.bookings || []); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <Title text1="List" text2="Bookings" />
      {error && <p role="alert" className="mt-4 text-red-400">{error}</p>}
      <div className="mt-6 max-w-5xl overflow-x-auto">
        <table className="w-full border-collapse overflow-hidden rounded-md text-nowrap">
          <thead><tr className="bg-primary/20 text-left text-white">
            <th className="p-3 font-medium">User Name</th>
            <th className="p-3 font-medium">Movie Name</th>
            <th className="p-3 font-medium">Show Time</th>
            <th className="p-3 font-medium">Seats</th>
            <th className="p-3 font-medium">Amount</th>
            <th className="p-3 font-medium">Payment</th>
          </tr></thead>
          <tbody className="text-sm">
            {bookings.map((item) => (
              <tr key={item._id} className="border-b border-primary/20 bg-primary/5 even:bg-primary/10">
                <td className="min-w-40 p-3">{item.user?.name || "User unavailable"}</td>
                <td className="p-3">{item.show?.movie?.title || "Movie unavailable"}</td>
                <td className="p-3">{item.show?.showDateTime ? dateformat(item.show.showDateTime) : "—"}</td>
                <td className="p-3">{Array.isArray(item.bookedSeats) ? item.bookedSeats.join(", ") : "—"}</td>
                <td className="p-3">{currency} {item.amount}</td>
                <td className="p-3">{item.isPaid ? "Paid" : "Pending"}</td>
              </tr>
            ))}
            {bookings.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-400">No bookings have been made yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListBookings;
