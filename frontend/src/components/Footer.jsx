import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../QuickShow-assets/assets/assets";

const Footer = () => (
  <footer className="mt-28 w-full border-t border-white/10 px-6 pt-12 text-gray-300 md:px-16 lg:px-36">
    <div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-10 md:flex-row">
      <div className="max-w-md">
        <Link to="/"><img alt="QuickShow" className="h-10 w-auto" src={assets.logo} /></Link>
        <p className="mt-5 text-sm leading-6 text-gray-400">
          Discover movies, explore upcoming shows and keep your favorite films in one place with QuickShow.
        </p>
        <div className="mt-5 flex items-center gap-3">
          <img src={assets.googlePlay} alt="Get it on Google Play" className="h-9 w-auto" />
          <img src={assets.appStore} alt="Download on the App Store" className="h-9 w-auto" />
        </div>
      </div>
      <div className="flex gap-16 text-sm">
        <div>
          <h2 className="mb-4 font-semibold text-white">Explore</h2>
          <ul className="space-y-3 text-gray-400">
            <li><Link className="hover:text-white" to="/">Home</Link></li>
            <li><Link className="hover:text-white" to="/movies">Movies</Link></li>
            <li><Link className="hover:text-white" to="/favorite">Favorites</Link></li>
            <li><Link className="hover:text-white" to="/my-bookings">My Bookings</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 font-semibold text-white">QuickShow</h2>
          <p className="max-w-44 leading-6 text-gray-400">Your movie discovery and showtime companion.</p>
        </div>
      </div>
    </div>
    <p className="py-5 text-center text-xs text-gray-500">© {new Date().getFullYear()} QuickShow. All rights reserved.</p>
  </footer>
);

export default Footer;
