import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/react";
import AdminNavbar from "../../components/admin/AdminNavbar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Loading from "../../components/Loading";
import { useApi } from "../../library/api";

const Layout = () => {
  const { isLoaded, isSignedIn } = useUser();
  const { request } = useApi();
  const navigate = useNavigate();
  const [access, setAccess] = useState("checking");

  useEffect(() => {
    let active = true;
    if (!isLoaded) return () => { active = false; };
    if (!isSignedIn) {
      setAccess("denied");
      return () => { active = false; };
    }
    request("/api/admin/is-admin")
      .then(() => { if (active) setAccess("allowed"); })
      .catch(() => { if (active) setAccess("denied"); });
    return () => { active = false; };
  }, [isLoaded, isSignedIn]);

  if (!isLoaded || access === "checking") return <Loading />;

  if (access === "denied") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl font-semibold">Admin access required</h1>
        <p className="mt-2 text-gray-400">Please sign in with an authorized admin account.</p>
        <button onClick={() => navigate("/")} className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-medium">Back to Home</button>
      </main>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="flex">
        <AdminSidebar />
        <div className="h-[calc(100vh-64px)] flex-1 overflow-y-auto px-4 py-10 md:px-10">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default Layout;
