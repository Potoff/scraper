import { createClient } from "@libsql/client";
import * as fs from "fs";
import * as path from "path";

export async function initializeDatabase() {
  try {
    const dbPath = process.env.DATABASE_URL || "./local_business_scraper.db";
    console.log("[Database] Initializing database at:", dbPath);

    const client = createClient({
      url: `file:${dbPath}`
    });

    // Read and execute the SQL migration file
    const migrationPath = path.join(process.cwd(), "drizzle", "0000_goofy_otto_octavius.sql");

    if (fs.existsSync(migrationPath)) {
      const sql = fs.readFileSync(migrationPath, "utf-8");

      // Split by statement-breakpoint and execute each statement
      const statements = sql
        .split("--> statement-breakpoint")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      for (const statement of statements) {
        try {
          await client.execute(statement);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          // Ignore "table already exists" errors
          if (!errorMessage.includes("already exists")) {
            console.error("[Database] Error executing statement:", errorMessage);
          }
        }
      }

      console.log("[Database] Tables created successfully");
    }

    // Create a default test user
    try {
      const timestamp = Date.now();
      await client.execute({
        sql: `INSERT OR IGNORE INTO users (openId, name, email, role, createdAt, updatedAt, lastSignedIn)
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: ["test_user_1", "Test User", "test@example.com", "user", timestamp, timestamp, timestamp]
      });
      console.log("[Database] Default test user created (ID: 1)");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.log("[Database] Test user already exists or error:", errorMessage);
    }

    client.close();
    console.log("[Database] Initialization complete");
  } catch (error) {
    console.error("[Database] Failed to initialize:", error);
    throw error;
  }
}
