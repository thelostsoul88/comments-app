import React, { useEffect, useState } from "react";
import CommentItem from "./CommentItem.jsx";
import { getComments } from "../services/api.js";
import { io } from "socket.io-client";
import { API_URL } from "../config.js";

const CommentTable = () => {
  const [comments, setComments] = useState([]);
  const [sortField, setSortField] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const socket = io(API_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("new-comment", () => {
      loadComments();
    });

    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    loadComments();
  }, [sortField, sortOrder, page]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const res = await getComments({
        page,
        pageSize: 25,
        sort: sortField,
        order: sortOrder,
      });

      setComments(res.items || []);
      setTotalPages(Math.ceil((res.total || 0) / (res.pageSize || 25)));
    } catch (err) {
      console.error("Ошибка при загрузке комментариев:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortField(field);
      setSortOrder("ASC");
    }
  };

  return (
    <div className="comment-table">
      <h2>Комментарии</h2>

      <div className="comment-sort">
        <button
          className={sortField === "username" ? "active" : ""}
          onClick={() => handleSort("username")}
        >
          Имя{" "}
          {sortField === "username" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
        </button>
        <button
          className={sortField === "email" ? "active" : ""}
          onClick={() => handleSort("email")}
        >
          Email {sortField === "email" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
        </button>
        <button
          className={sortField === "created_at" ? "active" : ""}
          onClick={() => handleSort("created_at")}
        >
          Дата{" "}
          {sortField === "created_at" ? (sortOrder === "ASC" ? "↑" : "↓") : ""}
        </button>
      </div>

      {loading ? (
        <p className="loading">Загрузка комментариев...</p>
      ) : comments.length === 0 ? (
        <p className="no-comments">Комментариев пока нет</p>
      ) : (
        <div className="comment-list">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentTable;
