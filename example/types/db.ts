import { episodesTable, podcastsTable } from "../db/schema"

// TODO: Infer type from DB
export type LocalEpisode = typeof episodesTable.$inferSelect
export type LocalEpisodeInsert = typeof episodesTable.$inferInsert

// This is to be able to consume both fetched and local episodes in the app
export type SharedEpisodeFields = Omit<LocalEpisode, "id" | "createdAt" | "updatedAt">

export type LocalPodcast = typeof podcastsTable.$inferSelect
export type LocalPodcastInsert = typeof podcastsTable.$inferInsert

// This is to be able to consume both fetched and local podcasts in the app
export type SharedPodcastFields = Omit<LocalPodcast, "id" | "createdAt" | "updatedAt">
