import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";
const api = axios.create({ baseURL: API_BASE, withCredentials: true });

export async function getComments({
  page = 1,
  pageSize = 25,
  sort = "created_at",
  order = "desc",
} = {}) {
  const { data } = await api.get("/comments", {
    params: { page, pageSize, sort, order },
  });
  return data;
}
export async function postComment(payload) {
  const { data } = await api.post("/comments", payload);
  return data;
}
export async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await api.post("/upload", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
export default api;
