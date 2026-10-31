import { ChartLineIcon, CircleDollarSignIcon, PlayCircleIcon, StarIcon, UsersIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import BlurCircle from "../../components/BlurCircle.jsx";
import Title from "../../components/admin/Title.jsx";
import { dateformat } from "../../library/dateformat.js";
import { useApi } from "../../library/api";

const DashBoard = () => {
  const { request } = useApi();
  const currency = import.meta.env.VITE_CURRENCY || "₹";
  const [dashboardData, setDashboardData] = useState({
    totalBookings: 0, totalRevenue: 0, activeShows: [], totalUser: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    request("/api/admin/dashboard")
      .then((data) => { if (active) setDashboardData(data.dashboardData); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <Loading />;

  const dashboardCards = [
    { title: "Total Bookings", value: dashboardData.totalBookings, icon: ChartLineIcon },
    { title: "Total Revenue", value: `${currency}${dashboardData.totalRevenue}`, icon: CircleDollarSignIcon },
    { title: "Active Shows", value: dashboardData.activeShows.length, icon: PlayCircleIcon },
    { title: "Total Users", value: dashboardData.totalUser, icon: UsersIcon },
  ];

  return (
    <div>
      <Title text1="Admin" text2="Dashboard" />
      {error && <p role="alert" className="mt-4 text-red-400">{error}</p>}
      <div className="relative mt-6 flex flex-wrap gap-4">
        <BlurCircle top="-100px" left="0" />
        <div className="flex w-full flex-wrap gap-4">
          {dashboardCards.map((card) => (
            <div key={card.title} className="flex w-full max-w-56 items-center justify-between rounded-md border border-primary/20 bg-primary/10 px-4 py-3">
              <div><h2 className="text-sm">{card.title}</h2><p className="mt-1 text-xl font-medium">{card.value}</p></div>
              <card.icon className="h-6 w-6" />
            </div>
          ))}
        </div>
      </div>
      <p className="mt-10 text-lg font-medium">Active Shows</p>
      <div className="relative mt-4 flex max-w-5xl flex-wrap gap-6">
        <BlurCircle top="100px" left="-10%" />
        {dashboardData.activeShows.map((show) => (
          <div key={show._id} className="h-full w-55 overflow-hidden rounded-lg border border-primary/20 pb-2 transition duration-300 hover:-translate-y-1">
            <img src={show.movie?.poster_path ? `https://image.tmdb.org/t/p/w500${show.movie.poster_path}` : "/placeholder.png"} alt={show.movie?.title || "Movie"} className="h-60 w-full object-cover" />
            <p className="truncate p-2 font-medium">{show.movie?.title}</p>
            <div className="flex items-center justify-between px-2">
              <p className="text-lg font-medium">{currency} {show.showPrice}</p>
              <p className="mt-1 flex items-center gap-1 pr-1 text-sm text-gray-400"><StarIcon className="h-4 w-4 fill-primary text-primary" />{Number(show.movie?.vote_average || 0).toFixed(1)}</p>
            </div>
            <p className="px-2 pt-2 text-sm text-gray-500">{dateformat(show.showDateTime)}</p>
          </div>
        ))}
        {dashboardData.activeShows.length === 0 && <p className="text-gray-400">No upcoming shows yet.</p>}
      </div>
    </div>
  );
};

export default DashBoard;
