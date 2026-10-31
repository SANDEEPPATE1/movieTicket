import { useCallback } from "react";
import { useAuth } from "@clerk/react";

export const getApiBaseUrl = () =>
  (import.meta.env.VITE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

export const useApi = () => {
  const { getToken } = useAuth();

  const request = useCallback(async (endpoint, options = {}) => {
    let token = null;

    try {
      token = await getToken();
    } catch (error) {
      console.warn("Could not retrieve Clerk session token:", error.message);
    }

    let response;
    try {
      response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
        ...options,
        signal: options.signal || AbortSignal.timeout(25000),
        headers: {
          ...(options.body ? { "Content-Type": "application/json" } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
      });
    } catch (error) {
      if (error.name === "TimeoutError" || error.name === "AbortError") {
        throw new Error("The server request timed out. Please try again.");
      }
      throw new Error(
        "Unable to reach the QuickShow backend. Check the configured API URL and backend deployment."
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json().catch(() => ({}))
      : { message: await response.text().catch(() => "") };

    if (!response.ok || data.success === false) {
      throw new Error(data.message || `Request failed with status ${response.status}.`);
    }

    return data;
  }, [getToken]);

  return { request };
};
