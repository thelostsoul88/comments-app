import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || process.env.POSTGRES_USER || "postgres",
  password: process.env.DB_PASS || process.env.POSTGRES_PASSWORD || "postgres",
  database: process.env.DB_NAME || process.env.POSTGRES_DB || "commentsdb",
  synchronize: true,
  logging: false,
  entities: [path.join(__dirname, "/entities/*.js")],
});
