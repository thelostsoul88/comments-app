import React, { useState, useEffect } from "react";
import CommentForm from "./CommentForm.jsx";
import Lightbox from "./Lightbox.jsx";
import api from "../services/api.js";

const CommentItem = ({ comment, onAdded = () => {} }) => {
  const [showReply, setShowReply] = useState(false);
  const [lb, setLb] = useState(null);
  const [replies, setReplies] = useState(comment.replies || []);
  const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const fetchReplies = async () => {
    try {
      const res = await api.get(`/comments?parentId=${comment.id}`);
      if (res.data?.items) setReplies(res.data.items);
    } catch (e) {
      console.error("Ошибка при загрузке ответов:", e);
    }
  };

  const handleReplyAdded = async () => {
    await fetchReplies();
    setShowReply(false);
    onAdded();
  };

  useEffect(() => {
    if (comment.replies?.length) setReplies(comment.replies);
  }, [comment]);

  return (
    <div className="comment-item fade-in">
      <div className="comment-meta">
        <strong>{comment.user?.username || "Аноним"}</strong>
        <span>{new Date(comment.created_at).toLocaleString()}</span>
      </div>

      <div className="comment-body">
        <div
          className="comment-text"
          dangerouslySetInnerHTML={{ __html: comment.text }}
        />

        {comment.files?.length > 0 && (
          <div className="comment-files">
            {comment.files.map((f) => {
              const filePath = f.file_url.startsWith("http")
                ? f.file_url
                : `${backendUrl}/${f.file_url.replace(/^\/+/, "")}`;
              return (
                <div key={f.id} className="file-item">
                  {f.file_type?.startsWith("image") ? (
                    <img
                      src={filePath}
                      alt="attachment"
                      className="comment-image"
                      onClick={() => setLb(filePath)}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <a
                      href={filePath}
                      target="_blank"
                      rel="noreferrer"
                      className="comment-file-link"
                    >
                      📄 Скачать файл
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="comment-actions">
        <button
          className="reply-button"
          onClick={async () => {
            if (!showReply && replies.length === 0) await fetchReplies();
            setShowReply((s) => !s);
          }}
        >
          {showReply ? "Отмена" : "Ответить"}
        </button>
      </div>

      {showReply && (
        <div className="reply-form-container fade-in">
          <CommentForm
            parentId={comment.id}
            onAdded={handleReplyAdded}
            compact
          />
        </div>
      )}

      {replies?.length > 0 && (
        <div className="replies-thread fade-in">
          {replies.map((r) => (
            <CommentItem key={r.id} comment={r} onAdded={onAdded} />
          ))}
        </div>
      )}

      <Lightbox src={lb} onClose={() => setLb(null)} />
    </div>
  );
};

export default CommentItem;
