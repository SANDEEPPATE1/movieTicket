import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import Title from "../../components/admin/Title.jsx";
import { dateformat } from "../../library/dateformat";
import { useApi } from "../../library/api";

const ListShows = () => {
  const { request } = useApi();
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    request("/api/admin/all-shows")
      .then((data) => { if (active) setShows(data.shows || []); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <Loading />;

  return (
    <div>
      <Title text1="List" text2="Shows" />
      {error && <p role="alert" className="mt-4 text-red-400">{error}</p>}
      <div className="mt-6 max-w-5xl overflow-x-auto">
        <table className="w-full border-collapse overflow-hidden rounded-md text-nowrap">
          <thead><tr className="bg-primary/20 text-left text-white">
            <th className="p-3 font-medium">Movie Name</th>
            <th className="p-3 font-medium">Show Time</th>
            <th className="p-3 font-medium">Booked Seats</th>
            <th className="p-3 font-medium">Potential Revenue</th>
          </tr></thead>
          <tbody className="text-sm">
            {shows.map((show) => {
              const bookedCount = Object.keys(show.occupiedSeats || {}).length;
              return <tr key={show._id} className="border-b border-primary/10 bg-primary/5 even:bg-primary/10">
                <td className="p-3">{show.movie?.title || "Movie unavailable"}</td>
                <td className="p-3">{dateformat(show.showDateTime)}</td>
                <td className="p-3">{bookedCount}</td>
                <td className="p-3">₹ {bookedCount * show.showPrice}</td>
              </tr>;
            })}
            {shows.length === 0 && <tr><td colSpan="4" className="p-4 text-center text-gray-400">No shows have been added yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListShows;
