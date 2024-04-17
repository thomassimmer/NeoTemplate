import axios from "axios";

export const axiosPrivate = axios.create({
  baseURL: process.env.NEXT_PRIVATE_BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});

export const axiosPublic = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: { "Content-Type": "application/json" },
});
