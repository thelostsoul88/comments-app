import express from "express";
import http from "http";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { AppDataSource } from "./db.js";
import commentRoutes from "./routes/comment.routes.js";
import captchaRoutes from "./routes/captcha.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import { runSeed } from "./seed.js";

dotenv.config();
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "https://comments-app-1eye.onrender.com",
  "https://comments-app-1.onrender.com",
  "http://localhost:5173",
];

const isProduction = process.env.NODE_ENV === "production";

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboard cat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 15 * 60 * 1000,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction, // secure=true только в продакшене
    },
  })
);

app.use(express.json());
app.use("/uploads", express.static("uploads"));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

app.use("/api/comments", commentRoutes);
app.use("/api/captcha", captchaRoutes);
app.use("/api/upload", uploadRoutes);

AppDataSource.initialize()
  .then(async () => {
    console.log("✅ Database connected");
    if ((process.env.SEED || "false").toLowerCase() === "true") {
      try {
        await runSeed();
      } catch (e) {
        console.error("Seed error:", e);
      }
    }
    const port = process.env.PORT || 3000;
    server.listen(port, () => console.log("Backend running on port", port));
  })
  .catch((err) => console.error("DB init error", err));

app.use((err, req, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE")
    return res
      .status(400)
      .json({ message: "Файл слишком большой (макс. 100KB)" });
  if (err && err.code === "INVALID_FILE_TYPE")
    return res.status(400).json({ message: "Неверный тип файла" });
  next(err);
});
