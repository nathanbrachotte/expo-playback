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

export const podcastsTable = sqliteTable("podcasts", {
  id: integer("id").primaryKey(),
  appleId: integer("apple_id").notNull(),
  author: text("author"),
  description: text("description"),
  image: text("image"),
  title: text("title").notNull(),
  ...sharedKeys,
})

// Only write from RN side
export const episodesTable = sqliteTable("episodes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  podcastId: integer("podcast_id")
    .notNull()
    .references(() => podcastsTable.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  publishedAt: integer("published_at", { mode: "timestamp" }).notNull(),
  duration: integer("duration").notNull(),
  shouldDownload: integer("should_download", { mode: "boolean" }).default(false),
  downloadUrl: text("download_url").notNull(),
  appleId: text("apple_id"),
  ...sharedKeys,
})

// Everything that the native thread is going to write to
export const episodeMetadatasTable = sqliteTable("episode_metadata", {
  episodeId: integer("episode_id")
    .primaryKey()
    .references(() => episodesTable.id),
  playback: integer("playback", { mode: "number" }).default(0),
  isFinished: integer("is_finished", { mode: "boolean" }).default(false),
  downloadProgress: integer("download_progress", { mode: "number" }).default(0),
  fileSize: integer("file_size", { mode: "number" }),
  filePath: text("file_path"),
})
