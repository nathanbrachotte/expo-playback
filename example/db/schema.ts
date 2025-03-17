import { sql } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const sharedKeys = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
};

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const podcasts = sqliteTable("podcasts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image"),
  downloadUrl: text("download_url"),
  ...sharedKeys,
});

// Only write from RN side
export const episodes = sqliteTable("episodes", {
  id: integer("id").primaryKey(),
  podcastId: integer("podcast_id")
    .notNull()
    .references(() => podcasts.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  publishedAt: integer("published_at", { mode: "timestamp" }).notNull(),
  duration: integer("duration").notNull(),
  ...sharedKeys,
});

// Everything that the native thread is going to write to
export const episodeMetadata = sqliteTable("episode_metadata", {
  episodeId: integer("episode_id")
    .primaryKey()
    .references(() => episodes.id),
  playback: integer("playback", { mode: "number" }).notNull(),
  isFinished: integer("is_finished", { mode: "boolean" })
    .notNull()
    .default(false),
  downloadProgress: integer("download_progress", { mode: "number" }),
  fileSize: integer("fileSize", { mode: "number" }),
});
