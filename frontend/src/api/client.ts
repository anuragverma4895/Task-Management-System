import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" }
});

api.interceptors.response.use(
  response => response,
  error => Promise.reject(new Error(error?.response?.data?.message || error?.message || "The request could not be completed."))
);

export default api;
