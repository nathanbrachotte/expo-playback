import { sql } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

// Helper function to generate UUID
// const generateUUID = sql`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`

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
  ...sharedKeys,
})

// Only write from RN side
export const episodesTable = sqliteTable(TABLE_NAMES[1], {
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
  duration: integer("duration").notNull(),
  downloadUrl: text("download_url").notNull(),
  appleId: text("apple_id"),
  ...sharedKeys,
})
