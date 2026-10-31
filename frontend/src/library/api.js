import { useAuth } from "@clerk/react";

export const getApiBaseUrl = () =>
  (import.meta.env.VITE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

export const useApi = () => {
  const { getToken } = useAuth();

  const request = async (endpoint, options = {}) => {
    let token = null;
    try {
      token = await getToken();
    } catch (error) {
      // Public endpoints should still work if Clerk cannot refresh a session.
      console.warn("Could not retrieve Clerk session token:", error.message);
    }

    let response;
    try {
      response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        ...options,
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });
    } catch (error) {
      throw new Error("Unable to reach the QuickShow server. Check the API URL and your internet connection.");
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }
    return data;
  };

  return { request };
};
