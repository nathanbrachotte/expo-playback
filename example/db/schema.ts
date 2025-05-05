import { sql } from "drizzle-orm"
import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core"

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

export const podcastsTable = sqliteTable(TABLE_NAMES[0], {
  id: integer("id").primaryKey(),
  appleId: integer("apple_id").notNull(),
  author: text("author"),
  description: text("description"),
  image30: text("image_30"),
  image60: text("image_60"),
  image100: text("image_100"),
  image600: text("image_600"),
  title: text("title").notNull(),
  rssFeedUrl: text("rss_feed_url"),
  isFollowed: integer("is_followed", { mode: "boolean" }).default(false),
  ...sharedKeys,
})

// Only write from RN side
export const episodesTable = sqliteTable(
  TABLE_NAMES[1],
  {
    id: integer("id").primaryKey(),
    podcastId: integer("podcast_id")
      .notNull()
      .references(() => podcastsTable.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    image30: text("image_30"),
    image60: text("image_60"),
    image100: text("image_100"),
    image600: text("image_600"),
    publishedAt: integer("published_at", { mode: "timestamp" }).notNull(),
    duration: integer("duration"),
    shouldDownload: integer("should_download", { mode: "boolean" }).default(false),
    downloadUrl: text("download_url").notNull(),
    rssId: text("rss_id").unique(),
    ...sharedKeys,
  },
  (t) => ({
    uniqueRssId: uniqueIndex("unique_rss_id").on(t.rssId),
  }),
)

// Everything that the native thread is going to write to
export const episodeMetadatasTable = sqliteTable(TABLE_NAMES[2], {
  episodeId: integer("episode_id")
    .primaryKey()
    .references(() => episodesTable.id),
  playback: integer("playback", { mode: "number" }).default(0),
  isFinished: integer("is_finished", { mode: "boolean" }).default(false),
  downloadProgress: integer("download_progress", { mode: "number" }).default(0),
  fileSize: integer("file_size", { mode: "number" }),
  filePath: text("file_path"),
})
