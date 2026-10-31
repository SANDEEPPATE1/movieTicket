import React from "react";
import { LayoutDashboard, ListCollapse, List, PlusSquare } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useUser } from "@clerk/react";
import { assets } from "../../QuickShow-assets/assets/assets";

const AdminSidebar = () => {
  const { user } = useUser();
  const links = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Add Shows", path: "/admin/add-shows", icon: PlusSquare },
    { name: "List Shows", path: "/admin/list-shows", icon: List },
    { name: "List Bookings", path: "/admin/list-bookings", icon: ListCollapse },
  ];

  return (
    <aside className="flex h-[calc(100vh-64px)] w-16 shrink-0 flex-col items-center border-r border-white/10 pt-8 text-sm md:w-60">
      <img src={user?.imageUrl || assets.profile} alt="Admin profile" className="h-10 w-10 rounded-full object-cover md:h-14 md:w-14" />
      <p className="mt-2 hidden max-w-full truncate px-2 text-base md:block">{user?.fullName || user?.firstName || "Admin"}</p>
      <nav className="mt-7 w-full">
        {links.map(({ name, path, icon: Icon }) => (
          <NavLink key={path} to={path} end={path === "/admin"}
            className={({ isActive }) => `relative flex w-full items-center justify-center gap-3 px-2 py-3 text-gray-400 transition hover:bg-white/5 md:justify-start md:px-8 ${isActive ? "bg-primary/15 text-primary" : ""}`}>
            {({ isActive }) => (
              <>
                <Icon className="h-5 w-5 shrink-0" />
                <span className="hidden md:block">{name}</span>
                {isActive && <span className="absolute right-0 h-8 w-1 rounded-l bg-primary" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
