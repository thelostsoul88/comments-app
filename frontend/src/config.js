const DEFAULT_API = "http://localhost:3000";
const PROD_API = "https://comments-app-1eye.onrender.com";

export const API_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost" ? DEFAULT_API : PROD_API);

export const API_BASE = `${API_URL}/api`;
