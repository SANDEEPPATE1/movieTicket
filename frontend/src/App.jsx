import React from "react";
import { Route, Routes, useLocation, Link } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Movies from "./pages/Movies";
import MovieDetails from "./pages/MovieDetails";
import SeatLayout from "./pages/SeatLayout";
import MyBookings from "./pages/MyBookings";
import Favorite from "./pages/Favorite";
import { Toaster } from "react-hot-toast";
import Layout from "./pages/admin/Layout";
import DashBoard from "./pages/admin/DashBoard";
import AddShows from "./pages/admin/AddShows";
import ListShows from "./pages/admin/ListShows";
import ListBookings from "./pages/admin/ListBookings";

const NotFound = () => (
  <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 pt-24 text-center">
    <p className="text-6xl font-bold text-primary">404</p>
    <h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
    <p className="mt-2 text-gray-400">The page you are looking for does not exist.</p>
    <Link to="/" className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-medium">Back to Home</Link>
  </main>
);

const App = () => {
  const isAdminRoute = useLocation().pathname.startsWith("/admin");

  return (
    <>
      <Toaster position="top-right" />
      {!isAdminRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/movies/:id/:date" element={<SeatLayout />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/favorite" element={<Favorite />} />
        <Route path="/admin" element={<Layout />}>
          <Route index element={<DashBoard />} />
          <Route path="add-shows" element={<AddShows />} />
          <Route path="list-shows" element={<ListShows />} />
          <Route path="list-bookings" element={<ListBookings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isAdminRoute && <Footer />}
    </>
  );
};

export default App;
