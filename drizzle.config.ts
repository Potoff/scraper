import { defineConfig } from "drizzle-kit";

const connectionString = process.env.DATABASE_URL || "./local_business_scraper.db";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: connectionString,
  },
});
