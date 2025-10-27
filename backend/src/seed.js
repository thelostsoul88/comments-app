import { AppDataSource } from "./db.js";

export async function runSeed() {
  try {
    await AppDataSource.query("TRUNCATE TABLE files RESTART IDENTITY CASCADE");
    await AppDataSource.query(
      "TRUNCATE TABLE comments RESTART IDENTITY CASCADE"
    );
    await AppDataSource.query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");
  } catch (_) {}

  const userRepo = AppDataSource.getRepository("User");
  const commentRepo = AppDataSource.getRepository("Comment");

  const user = await userRepo.save({
    username: "TestUser",
    email: "test@example.com",
    homepage: "https://example.com",
  });

  await commentRepo.save({
    text: "Это тестовый заглавный комментарий 😊",
    user,
    parent: null,
  });

  console.log("Seed: создал TestUser и один тестовый комментарий");
}
