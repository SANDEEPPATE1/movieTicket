import { useAuth } from "@clerk/react";

export const getApiBaseUrl = () =>
  (import.meta.env.VITE_BASE_URL || "http://localhost:3000").replace(/\/$/, "");

export const useApi = () => {
  const { getToken } = useAuth();

  const request = async (endpoint, options = {}) => {
    const token = await getToken();
    const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success === false) {
      throw new Error(data.message || `Request failed (${response.status})`);
    }
    return data;
  };

  return { request };
};
