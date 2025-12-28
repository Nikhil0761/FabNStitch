import axios from "axios";

const API = axios.create({
  baseURL: "https://api.fabnstitch.com/api",
});

/* Attach JWT automatically */
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("fabnstitch_token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
