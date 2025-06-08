import { episodeMetadatasTable, episodesTable, podcastsTable } from "../db/schema"

// TODO: Infer type from DB
export type LocalEpisode = typeof episodesTable.$inferSelect
export type LocalEpisodeInsert = typeof episodesTable.$inferInsert

// This is to be able to consume both fetched and local episodes in the app
export type SharedEpisodeFields = Omit<LocalEpisode, "createdAt" | "updatedAt" | "id">

export type LocalPodcast = typeof podcastsTable.$inferSelect
export type LocalPodcastInsert = typeof podcastsTable.$inferInsert

// This is to be able to consume both fetched and local podcasts in the app
export type SharedPodcastFields = Omit<LocalPodcast, "createdAt" | "updatedAt" | "id">

export type LocalEpisodeMetadata = typeof episodeMetadatasTable.$inferSelect
export type LocalEpisodeMetadataInsert = typeof episodeMetadatasTable.$inferInsert

// Maybe there is a way to extract this from the type directly?
type Sizes = "30" | "60" | "100" | "600"
export type EntityImage = Pick<LocalEpisode, `image${Sizes}`>
