import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = sqliteTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: text("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: text("email", { length: 320 }),
  loginMethod: text("loginMethod", { length: 64 }),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Scraping search queries - tracks user searches
 */
export const scrapingSearches = sqliteTable("scraping_searches", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  department: text("department", { length: 100 }).notNull(),
  sector: text("sector", { length: 255 }).notNull(),
  totalResults: integer("totalResults").default(0),
  status: text("status", { enum: ["pending", "processing", "completed", "failed"] }).default("pending"),
  errorMessage: text("errorMessage"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type ScrapingSearch = typeof scrapingSearches.$inferSelect;
export type InsertScrapingSearch = typeof scrapingSearches.$inferInsert;

/**
 * Business results - individual businesses found during scraping
 */
export const businessResults = sqliteTable("business_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  searchId: integer("searchId").notNull().references(() => scrapingSearches.id, { onDelete: "cascade" }),
  businessName: text("businessName", { length: 255 }).notNull(),
  website: text("website", { length: 500 }),
  email: text("email", { length: 320 }).notNull(),
  phone: text("phone", { length: 20 }),
  address: text("address"),
  city: text("city", { length: 100 }),
  postalCode: text("postalCode", { length: 10 }),
  emailSource: text("emailSource", { length: 500 }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export type BusinessResult = typeof businessResults.$inferSelect;
export type InsertBusinessResult = typeof businessResults.$inferInsert;