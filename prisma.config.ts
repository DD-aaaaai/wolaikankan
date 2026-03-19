import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"] || "file:./prisma/dev.db",
    ...(process.env["DATABASE_AUTH_TOKEN"]
      ? { authToken: process.env["DATABASE_AUTH_TOKEN"] }
      : {}),
  },
});
