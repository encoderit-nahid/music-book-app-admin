import axios from "axios";
import { toast } from "sonner";
import { API_BASE_URL } from "./consts";
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: redirect on 401, display toasts for handled errors,
// propagate everything so callers can still handle individually.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // 422 — forms handle their own validation; pass through
    if (error.response?.status === 422) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    if (status === 403) {
      toast.error(serverMessage || "You don't have permission to perform this action.");
    } else if (status === 404) {
      toast.error(serverMessage || "The requested resource was not found.");
    } else if (status === 429) {
      toast.error("Too many requests. Please slow down.");
    } else if (status && status >= 500) {
      toast.error(serverMessage || "Server error. Please try again later.");
    } else if (!error.response) {
      toast.error("Network error. Check your connection.");
    }

    return Promise.reject(error);
  }
);
