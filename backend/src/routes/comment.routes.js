import express from "express";
import sanitizeHtml from "sanitize-html";
import { AppDataSource } from "../db.js";
import { IsNull } from "typeorm";
import { isValidXHTML } from "../utils/htmlValidate.js";

const router = express.Router();

// ========================= GET =========================
router.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(req.query.pageSize || "25", 10), 1),
      100
    );
    const sort = (req.query.sort || "created_at").toString();
    const order =
      (req.query.order || "desc").toString().toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";

    const repo = AppDataSource.getRepository("Comment");
    const parentId = req.query.parentId;

    let where = {};
    if (parentId) where = { parent: { id: parentId } };
    else where = { parent: IsNull() };

    const [items, total] = await repo.findAndCount({
      where,
      relations: [
        "user",
        "files",
        "replies",
        "replies.user",
        "replies.files",
        "replies.replies",
        "replies.replies.user",
        "replies.replies.files",
      ],
      order:
        sort === "username"
          ? { user: { username: order } }
          : sort === "email"
          ? { user: { email: order } }
          : { created_at: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    res.json({ items, total, page, pageSize });
  } catch (e) {
    console.error("GET /comments error:", e);
    res.status(500).json({ message: e.message });
  }
});

// ========================= POST =========================
router.post("/", async (req, res) => {
  try {
    const { username, email, homepage, text, parentId, captcha, file } =
      req.body;

    // CAPTCHA проверка
    if (
      !req.session ||
      !req.session.captcha ||
      (captcha || "").toLowerCase() !== req.session.captcha
    ) {
      return res.status(400).json({ message: "Invalid CAPTCHA" });
    }

    // Очистка HTML и валидация тегов
    const cleanText = sanitizeHtml(text || "", {
      allowedTags: ["a", "i", "strong", "code"],
      allowedAttributes: { a: ["href", "title"] },
    }).trim();

    if (!isValidXHTML(cleanText)) {
      return res.status(400).json({
        message:
          "Невалидные HTML-теги (должен быть корректный XHTML и только разрешённые теги).",
      });
    }

    if (!username || !email || !cleanText) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const userRepo = AppDataSource.getRepository("User");
    const cRepo = AppDataSource.getRepository("Comment");
    const fRepo = AppDataSource.getRepository("File");

    let user = await userRepo.findOneBy({ email });
    if (!user) user = await userRepo.save({ username, email, homepage });

    const parent = parentId ? await cRepo.findOneBy({ id: parentId }) : null;

    const saved = await cRepo.save({ text: cleanText, user, parent });

    if (file && file.url) {
      await fRepo.save({
        file_url: file.url,
        file_type: file.type || "unknown",
        comment: saved,
      });
    }

    try {
      req.app.get("io").emit("new-comment", { id: saved.id });
    } catch (_) {}

    if (req.session) req.session.captcha = null;

    const fullComment = await cRepo.findOne({
      where: { id: saved.id },
      relations: ["user", "files", "replies", "replies.user", "replies.files"],
    });

    res.json(fullComment);
  } catch (e) {
    console.error("POST /comments error:", e);
    res.status(500).json({ message: e.message });
  }
});

export default router;
