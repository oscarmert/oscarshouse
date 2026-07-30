import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs as a standalone CLI (not through Next.js), so .env.local
// isn't loaded automatically the way it is for `next dev`/`next build`.
loadEnv({ path: ".env.local" });
loadEnv(); // also pick up a plain .env if present

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

export default defineConfig(
  tursoUrl
    ? {
        schema: "./src/db/schema.ts",
        out: "./drizzle",
        dialect: "turso",
        dbCredentials: {
          url: tursoUrl,
          authToken: tursoToken,
        },
      }
    : {
        schema: "./src/db/schema.ts",
        out: "./drizzle",
        dialect: "sqlite",
        dbCredentials: {
          url: "./data/app.db",
        },
      }
);
