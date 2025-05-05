import { z } from "zod"

import { RssItemSchema } from "./rss.fetch"
import { SharedEpisodeFields, SharedPodcastFields } from "../types/db.types"

export const ToLocalPodcastSchema = z
  .object({
    artistName: z.string(),
    collectionName: z.string(),
    trackId: z.number(),
    artworkUrl30: z.string().optional(),
    artworkUrl60: z.string().optional(),
    artworkUrl100: z.string(),
    artworkUrl600: z.string().optional(),
    feedUrl: z.string().optional(),
    collectionId: z.number(),
    collectionViewUrl: z.string(),
    trackName: z.string(),
    trackViewUrl: z.string(),
    trackCount: z.number(),
    primaryGenreName: z.string(),
    releaseDate: z.string(),
    country: z.string(),
    kind: z.literal("podcast"),
    currency: z.string(),
    contentAdvisoryRating: z.string().optional(),
    collectionExplicitness: z.string().optional(),
    trackExplicitness: z.string().optional(),
    collectionPrice: z.number().optional(),
    trackPrice: z.number().optional(),
    trackTimeMillis: z.number().optional(),
    wrapperType: z.literal("track"), //? WTF is that shit?
  })
  .transform(
    (data) =>
      ({
        appleId: data.trackId,
        author: data.artistName,
        title: data.collectionName,
        image30: data.artworkUrl30 || null,
        image60: data.artworkUrl60 || null,
        image100: data.artworkUrl100 || null,
        image600: data.artworkUrl600 || null,
        description: "",
        //? id should be added manually when needed. Or should it?
        rssFeedUrl: data.feedUrl || null,
        isFollowed: false,
      }) satisfies Omit<SharedPodcastFields, "id">,
  )

export const ToLocalEpisodeSchema = z
  .object({
    artistIds: z.array(z.string()).optional(),
    artworkUrl160: z.string().optional(),
    artworkUrl60: z.string(),
    artworkUrl600: z.string().optional(),
    closedCaptioning: z.string().optional(),
    collectionId: z.number(),
    collectionName: z.string(),
    collectionViewUrl: z.string(),
    contentAdvisoryRating: z.string(),
    country: z.string(),
    description: z.string().optional(),
    episodeContentType: z.string().optional(),
    episodeFileExtension: z.string().optional(),
    episodeGuid: z.string().optional(),
    episodeUrl: z.string().optional(),
    feedUrl: z.string(),
    genres: z.any().optional(),
    kind: z.literal("podcast-episode").optional(),
    previewUrl: z.string().optional(),
    releaseDate: z.string(),
    shortDescription: z.string().optional(),
    trackId: z.number(),
    trackName: z.string(),
    trackTimeMillis: z.number().optional(),
    trackViewUrl: z.string(),
    wrapperType: z.literal("podcastEpisode").optional(),
    // Fields from single podcast response
    artistName: z.string().optional(),
    artworkUrl100: z.string().optional(),
    collectionCensoredName: z.string().optional(),
    collectionExplicitness: z.string().optional(),
    collectionHdPrice: z.number().optional(),
    collectionPrice: z.number().optional(),
    currency: z.string().optional(),
    genreIds: z.array(z.string()).optional(),
    primaryGenreName: z.string().optional(),
    trackCensoredName: z.string().optional(),
    trackCount: z.number().optional(),
    trackExplicitness: z.string().optional(),
    trackPrice: z.number().optional(),
  })
  .transform(
    ({
      trackName,
      shortDescription,
      description,
      artworkUrl600,
      artworkUrl100,
      artworkUrl160,
      artworkUrl60,
      releaseDate,
      trackTimeMillis,
      episodeUrl,
      collectionId,
      trackId,
    }) => {
      return {
        title: trackName,
        description: description || shortDescription || "",
        image30: null,
        image60: artworkUrl60 || null,
        image100: artworkUrl100 || null,
        image600: artworkUrl600 || null,
        publishedAt: new Date(releaseDate),
        duration: trackTimeMillis,
        shouldDownload: false,
        downloadUrl: episodeUrl || "",
        podcastId: collectionId,
        rssId: trackId.toString(),
      } satisfies Omit<SharedEpisodeFields, "id">
    },
  )

export const ToEpisodeFromRSSSchema = RssItemSchema.transform((data) => {
  // TODO: This whole duration math is fucked up
  // Convert duration from "HH:MM:SS" to milliseconds
  const durationParts = typeof data["itunes:duration"] === "string" ? data["itunes:duration"].split(":") : []
  let duration = 0
  if (durationParts.length === 3) {
    duration =
      parseInt(durationParts[0]) * 3600000 + parseInt(durationParts[1]) * 60000 + parseInt(durationParts[2]) * 1000
  } else if (durationParts.length === 2) {
    duration = parseInt(durationParts[0]) * 60000 + parseInt(durationParts[1]) * 1000
  } else {
    duration = parseInt(durationParts[0]) * 1000
  }

  return {
    title: String(data.title),
    duration,
    publishedAt: new Date(data.pubDate),
    downloadUrl: data.enclosure?.url || "",
    image30: null,
    image60: null,
    // TODO: Check this is the right size roughly
    image100: data["itunes:image"]?.href || null,
    image600: null,
    description: data.description || "",
    shouldDownload: false,
    //!!!!!!!!! CHECK CHANGE THIS TO RSS ID
    rssId: typeof data.guid === "string" ? data.guid : data.guid?.["#text"] || null,
    // `podcastId` is not part of the RSS response
  } satisfies Omit<SharedEpisodeFields, "id" | "podcastId">
})

export type ParsedLocalPodcastSchema = z.infer<typeof ToLocalPodcastSchema>
export type ParsedLocalEpisodeSchema = z.infer<typeof ToLocalEpisodeSchema>
export type ParsedRssEpisodeSchema = z.infer<typeof ToEpisodeFromRSSSchema>
