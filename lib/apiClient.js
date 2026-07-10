import axios from "axios";

// Shared axios instance. withCredentials isn't needed since we call our
// own same-origin API routes and the auth cookie is httpOnly + set by
// the server directly — the browser attaches it automatically.
const apiClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export default apiClient;