import React, { useEffect, useState, useCallback } from "react";
import { getComments } from "./services/api.js";
import CommentForm from "./components/CommentForm.jsx";
import CommentTable from "./components/CommentTable.jsx";
import Pagination from "./components/Pagination.jsx";
import io from "socket.io-client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket = io("http://localhost:3000");

export default function App() {
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [sort, setSort] = useState("created_at");
  const [order, setOrder] = useState("desc");
  const [data, setData] = useState({ items: [], total: 0 });

  const fetchComments = useCallback(async () => {
    const result = await getComments({ page, pageSize, sort, order });
    setData(result);
  }, [page, pageSize, sort, order]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleAdded = () => {
    setPage(1);
    fetchComments();
  };

  useEffect(() => {
    socket.on("new-comment", fetchComments);
    return () => socket.off("new-comment", fetchComments);
  }, [fetchComments]);

  const onSort = (field) => {
    if (field === sort) setOrder(order === "asc" ? "desc" : "asc");
    else {
      setSort(field);
      setOrder("asc");
    }
    setPage(1);
  };

  return (
    <div>
      <h2>Comments App</h2>
      <CommentForm onAdded={handleAdded} />
      <CommentTable
        data={data.items}
        sort={sort}
        order={order}
        onSort={onSort}
        onAdded={handleAdded}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={data.total}
        onPage={setPage}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
