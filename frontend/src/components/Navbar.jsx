import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, Ticket, Heart, ShieldCheck } from "lucide-react";
import { useClerk, UserButton, useUser } from "@clerk/react";
import logo from "../QuickShow-assets/assets/logo.svg";
import { useApi } from "../library/api";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [movies, setMovies] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const { request } = useApi();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    request("/api/show/all")
      .then((data) => { if (active) setMovies(data.shows || []); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (!isSignedIn) { setIsAdmin(false); return; }
    request("/api/admin/is-admin")
      .then((data) => { if (active) setIsAdmin(Boolean(data.isAdmin)); })
      .catch(() => { if (active) setIsAdmin(false); });
    return () => { active = false; };
  }, [isSignedIn]);

  const results = searchText.trim()
    ? movies.filter((movie) => movie.title?.toLowerCase().includes(searchText.trim().toLowerCase())).slice(0, 6)
    : [];

  const go = (path) => {
    navigate(path);
    setMenuOpen(false);
    setSearchOpen(false);
    setSearchText("");
    window.scrollTo(0, 0);
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-white/5 bg-black/65 px-5 py-4 backdrop-blur-xl md:px-12 lg:px-24">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5">
        <Link to="/" onClick={() => window.scrollTo(0, 0)} className="shrink-0">
          <img src={logo} alt="QuickShow" className="h-9 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
          <Link className="transition hover:text-white" to="/">Home</Link>
          <Link className="transition hover:text-white" to="/movies">Movies</Link>
          <Link className="transition hover:text-white" to="/favorite">Favorites</Link>
          {isSignedIn && <Link className="transition hover:text-white" to="/my-bookings">My Bookings</Link>}
          {isAdmin && <Link className="flex items-center gap-1 text-primary hover:text-white" to="/admin"><ShieldCheck size={16}/> Admin</Link>}
        </nav>

        <div className="flex items-center gap-3">
          <button aria-label="Search movies" onClick={() => setSearchOpen((value) => !value)}
            className="rounded-full p-2 text-gray-200 transition hover:bg-white/10"><Search size={20}/></button>
          {isSignedIn ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action label="My Bookings" labelIcon={<Ticket width={15}/>} onClick={() => go("/my-bookings")}/>
                <UserButton.Action label="Favorites" labelIcon={<Heart width={15}/>} onClick={() => go("/favorite")}/>
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <button onClick={() => openSignIn()} className="rounded-full bg-primary px-5 py-2 text-sm font-medium transition hover:bg-primary-dull">Login</button>
          )}
          <button aria-label="Toggle navigation" onClick={() => setMenuOpen((value) => !value)} className="rounded-lg p-2 text-white hover:bg-white/10 md:hidden">
            {menuOpen ? <X size={23}/> : <Menu size={23}/>}
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="absolute left-0 top-full w-full border-t border-white/10 bg-[#101014] px-5 py-4 shadow-2xl md:px-12">
          <div className="mx-auto max-w-3xl">
            <input autoFocus value={searchText} onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search movies..." className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-primary"/>
            {searchText.trim() && (
              <div className="mt-2 overflow-hidden rounded-lg border border-white/10 bg-[#19191f]">
                {results.length ? results.map((movie) => (
                  <button key={movie._id} onClick={() => go(`/movies/${movie._id}`)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-white/10">
                    <img src={movie.poster_path ? (movie.poster_path.startsWith("http") ? movie.poster_path : `https://image.tmdb.org/t/p/w92${movie.poster_path}`) : "/placeholder.png"} alt="" className="h-12 w-9 rounded object-cover"/>
                    <span>{movie.title}</span>
                  </button>
                )) : <p className="px-4 py-3 text-sm text-gray-400">No matching movies found.</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {menuOpen && (
        <nav className="absolute left-0 top-full flex w-full flex-col gap-1 border-t border-white/10 bg-[#101014] p-5 text-gray-200 shadow-xl md:hidden">
          <button onClick={() => go("/")} className="rounded-lg px-4 py-3 text-left hover:bg-white/5">Home</button>
          <button onClick={() => go("/movies")} className="rounded-lg px-4 py-3 text-left hover:bg-white/5">Movies</button>
          <button onClick={() => go("/favorite")} className="rounded-lg px-4 py-3 text-left hover:bg-white/5">Favorites</button>
          {isSignedIn && <button onClick={() => go("/my-bookings")} className="rounded-lg px-4 py-3 text-left hover:bg-white/5">My Bookings</button>}
          {isAdmin && <button onClick={() => go("/admin")} className="rounded-lg px-4 py-3 text-left text-primary hover:bg-white/5">Admin Dashboard</button>}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
