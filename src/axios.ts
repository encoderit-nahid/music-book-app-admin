import axios from "axios";
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

// Response interceptor: redirect on 401, propagate errors to caller handlers
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    // } else if (error.response?.status === 422) {
    //   // Validation errors — let the caller handle them
    //   const data = error.response?.data;
    //   const message =
    //     data?.message || "Validation failed. Please check your input.";
    //   toast.error(message);
    // } else if (error.response?.status === 403) {
    //   toast.error("You don't have permission to perform this action.");
    // } else if (error.response?.status === 404) {
    //   toast.error("Resource not found.");
    // } else if (error.response?.status && error.response.status >= 500) {
    //   toast.error("Server error. Please try again later.");
    // } else if (!error.response) {
    //   toast.error("Network error. Check your connection.");
    }

    return Promise.reject(error);
  }
);
