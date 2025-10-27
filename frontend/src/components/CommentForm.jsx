import React, { useState, useEffect, useRef, useMemo } from "react";
import { postComment, uploadFile } from "../services/api.js";
import { toast } from "react-toastify";
import { io } from "socket.io-client";
import { API_URL } from "../config.js";

const allowedTags = ["a", "i", "strong", "code"];

const socket = io(API_URL, {
  transports: ["websocket"],
  withCredentials: true,
});

const isValidXHTML = (html) => {
  const tagRegex = /<\/?([a-zA-Z]+)(\s+[^>]*)?>/g;
  const stack = [];
  let m;
  while ((m = tagRegex.exec(html)) !== null) {
    const raw = m[0];
    const tag = m[1].toLowerCase();
    const isClosing = raw.startsWith("</");
    const isSelfClosing = /\/>\s*$/.test(raw);
    if (!allowedTags.includes(tag)) return false;
    if (isSelfClosing) continue;
    if (!isClosing) stack.push(tag);
    else {
      if (!stack.length) return false;
      const top = stack.pop();
      if (top !== tag) return false;
    }
  }
  return stack.length === 0;
};

const SHOW_PREVIEW =
  (import.meta.env.VITE_SHOW_MESSAGE_PREVIEW || "false").toString() === "false";

const saveHints = (username, email, homepage) => {
  try {
    const k = "__comment_hints__";
    const prev = JSON.parse(localStorage.getItem(k) || "{}");
    const next = {
      usernames: Array.from(
        new Set([...(prev.usernames || []), username])
      ).slice(-5),
      emails: Array.from(new Set([...(prev.emails || []), email])).slice(-5),
      homepages: homepage
        ? Array.from(new Set([...(prev.homepages || []), homepage])).slice(-5)
        : prev.homepages || [],
    };
    localStorage.setItem(k, JSON.stringify(next));
  } catch {}
};

const readHints = () => {
  try {
    return JSON.parse(localStorage.getItem("__comment_hints__") || "{}");
  } catch {
    return {};
  }
};

export default function CommentForm({
  onAdded = () => {},
  parentId = null,
  compact = false,
}) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    homepage: "",
    text: "",
    captcha: "",
  });
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [captchaUrl, setCaptchaUrl] = useState(`${API_URL}/api/captcha/png`);
  const [loading, setLoading] = useState(false);
  const textRef = useRef(null);
  const fileInputRef = useRef(null);

  const hints = useMemo(readHints, []);

  const reloadCaptcha = () =>
    setCaptchaUrl(`${API_URL}/api/captcha/png?ts=${Date.now()}`);

  useEffect(() => {
    reloadCaptcha();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (f) => {
    setFilePreview(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (f.type === "text/plain" && f.size > 100 * 1024) {
      toast.warn("⚠️ Текстовый файл слишком большой! Макс. 100 KB");
      return;
    }
    setFile(f);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setFilePreview({ type: "image", src: url });
    } else if (f.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || "")
          .split("\n")
          .slice(0, 10)
          .join("\n");
        setFilePreview({ type: "text", content: text });
      };
      reader.readAsText(f);
    }
  };

  const insertTag = (tag) => {
    const el = textRef.current;
    if (!el) return;
    const { selectionStart, selectionEnd, value } = el;
    const selected = value.slice(selectionStart, selectionEnd);
    let wrapped;
    if (tag === "a")
      wrapped = `<a href="" title="">${selected || "ссылка"}</a>`;
    else wrapped = `<${tag}>${selected || tag}</${tag}>`;
    const next =
      value.slice(0, selectionStart) + wrapped + value.slice(selectionEnd);
    setForm((f) => ({ ...f, text: next }));
    setTimeout(() => {
      el.focus();
      const pos = selectionStart + wrapped.length;
      el.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      if (!isValidXHTML(form.text)) {
        toast.warn("⚠️ Невалидные HTML-теги. Разрешены: a, i, strong, code.");
        return;
      }

      setLoading(true);

      let uploaded = null;
      if (file) {
        uploaded = await uploadFile(file);
      }

      await postComment({ ...form, parentId, file: uploaded });

      socket.emit("client:new-comment", { parentId: parentId || null });

      onAdded();

      saveHints(form.username, form.email, form.homepage);

      toast.success(
        parentId ? "✅ Ответ добавлен!" : "✅ Комментарий добавлен!"
      );
      setForm({ username: "", email: "", homepage: "", text: "", captcha: "" });
      setFile(null);
      setFilePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      reloadCaptcha();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Ошибка";
      if (msg.toLowerCase().includes("captcha"))
        toast.error("❌ Неправильная капча!");
      else if (msg.includes("тип")) toast.error("⚠️ Неверный тип файла!");
      else if (msg.includes("большой")) toast.warn("⚠️ Файл слишком большой!");
      else toast.error("🚨 Ошибка при отправке!");
      reloadCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={compact ? "reply-box" : ""}
      autoComplete="on"
    >
      {!compact && (
        <div className="toolbar">
          <button type="button" onClick={() => insertTag("i")}>
            [i]
          </button>
          <button type="button" onClick={() => insertTag("strong")}>
            [strong]
          </button>
          <button type="button" onClick={() => insertTag("code")}>
            [code]
          </button>
          <button type="button" onClick={() => insertTag("a")}>
            [a]
          </button>
        </div>
      )}

      <input
        name="username"
        placeholder="Имя"
        value={form.username}
        onChange={handleChange}
        list="hint-usernames"
        autoComplete="username"
        required
      />
      <datalist id="hint-usernames">
        {(hints.usernames || []).map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>

      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        list="hint-emails"
        autoComplete="email"
        required
      />
      <datalist id="hint-emails">
        {(hints.emails || []).map((e) => (
          <option key={e} value={e} />
        ))}
      </datalist>

      {!compact && (
        <>
          <input
            name="homepage"
            placeholder="Домашняя страница (опционально)"
            value={form.homepage}
            onChange={handleChange}
            list="hint-homepages"
            autoComplete="url"
          />
          <datalist id="hint-homepages">
            {(hints.homepages || []).map((h) => (
              <option key={h} value={h} />
            ))}
          </datalist>
        </>
      )}

      <textarea
        ref={textRef}
        name="text"
        placeholder="Текст комментария"
        value={form.text}
        onChange={handleChange}
        autoComplete="on"
        required
      />

      <div className="captcha-container">
        <img src={captchaUrl} alt="captcha" />
        <button type="button" onClick={reloadCaptcha} title="Обновить капчу">
          🔄
        </button>
      </div>

      <input
        name="captcha"
        placeholder="Введите капчу"
        value={form.captcha}
        onChange={handleChange}
        autoComplete="one-time-code"
        required
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,text/plain"
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {filePreview && (
        <div className="file-preview">
          {filePreview.type === "image" ? (
            <img src={filePreview.src} alt="preview" />
          ) : (
            <pre>{filePreview.content}</pre>
          )}
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? "Отправка..." : parentId ? "Ответить" : "Отправить"}
      </button>

      {SHOW_PREVIEW && (
        <div
          style={{
            marginTop: 8,
            background: "#fff",
            padding: 8,
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Предпросмотр</div>
          <div dangerouslySetInnerHTML={{ __html: form.text }} />
        </div>
      )}
    </form>
  );
}
