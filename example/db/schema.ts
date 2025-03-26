import { sql } from "drizzle-orm"
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const sharedKeys = {
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}

export const TABLE_NAMES = ["podcasts", "episodes", "episode_metadata"] as const
export type TableName = (typeof TABLE_NAMES)[number]

export const podcasts = sqliteTable("podcasts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  image: text("image"),
  ...sharedKeys,
})

// Only write from RN side
export const episodes = sqliteTable("episodes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  podcastId: integer("podcast_id")
    .notNull()
    .references(() => podcasts.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  publishedAt: integer("published_at", { mode: "timestamp" }).notNull(),
  duration: integer("duration").notNull(),
  downloadUrl: text("download_url").notNull(),
  ...sharedKeys,
})

// Everything that the native thread is going to write to
export const episodeMetadata = sqliteTable("episode_metadata", {
  episodeId: integer("episode_id")
    .primaryKey()
    .references(() => episodes.id),
  playback: integer("playback", { mode: "number" }).default(0),
  isFinished: integer("is_finished", { mode: "boolean" }).default(false),
  downloadProgress: integer("download_progress", { mode: "number" }).default(0),
  fileSize: integer("file_size", { mode: "number" }),
  filePath: text("file_path"),
})
