const required = (key: string, value: string | undefined): string => {
  if (!value) throw new Error(`Missing required env var: ${key}`);
  return value;
};

export const API_BASE_URL = required("VITE_API_BASE_URL", import.meta.env.VITE_API_BASE_URL);
export const OPENWEATHER_KEY = import.meta.env.VITE_OPENWEATHER_KEY;
export const PUSHER_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
export const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;