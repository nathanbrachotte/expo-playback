import { z } from "zod"

import { RssItem, RssItemSchema } from "./rss.fetch"
import { RSSFeedEpisodeFields, SharedEpisodeFields, SharedPodcastFields } from "../types/db.types"
import { MISSING_VALUES_EPISODE } from "../utils/episodes.utils"
import { Optional } from "../utils/types.utils"

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
        extraInfo: {
          episodeCount: data.trackCount,
        },
      }) satisfies Omit<SharedPodcastFields, "id"> & { extraInfo: { episodeCount: number } },
  )

export const ToLocalEpisodeSchema = z
  .object({
    artistIds: z.array(z.union([z.string(), z.number()])).optional(),
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
      ...rest
    }) => {
      return {
        title: trackName,
        description: description || shortDescription || "",
        image30: null,
        image60: artworkUrl60 || null,
        image100: artworkUrl100 || null,
        image600: artworkUrl600 || null,
        publishedAt: new Date(releaseDate),
        duration: trackTimeMillis ?? null,
        shouldDownload: false,
        downloadUrl: episodeUrl || "",
        podcastId: collectionId,
        rssId: trackId.toString(),
      } satisfies Omit<SharedEpisodeFields, "id">
    },
  )

export function calculateDuration(itemDuration: Optional<number | string>) {
  const durationParts = itemDuration ? String(itemDuration).split(":") : []

  let duration = 0
  if (durationParts.length === 3) {
    duration =
      parseInt(durationParts[0]) * 3600000 +
      parseInt(durationParts[1]) * 60000 +
      parseInt(durationParts[2]) * 1000
  } else if (durationParts.length === 2) {
    duration = parseInt(durationParts[0]) * 60000 + parseInt(durationParts[1]) * 1000
  } else {
    duration = parseInt(durationParts[0]) * 1000
  }

  return duration
}

function extractRssId(guid: RssItem["guid"]) {
  if (!guid) {
    return null
  }
  if (typeof guid === "string") {
    return guid
  }

  if (typeof guid["#text"] === "string") {
    return guid["#text"]
  }

  if (typeof guid["#text"] === "number") {
    return guid["#text"].toString()
  }

  return null
}

const LOG_LEVEL: "debug" | "error" | "none" | unknown = "none"

export const FromRSSItemToLocalEpisodeSchema = RssItemSchema.transform((data) => {
  const itunesDuration = data["itunes:duration"]

  if (!data.pubDate) {
    console.warn("⚠️ FOUND EPISODE WITHOUT PUBLISHED DATE", JSON.stringify(data, null, 2))
  }

  if (LOG_LEVEL === "debug") {
    console.log(
      "🚀 ~ ToEpisodeFromRSSSchema ~ new item to be created:",
      JSON.stringify(data, null, 2),
    )
  }

  return {
    title: String(data.title),
    duration: calculateDuration(itunesDuration),
    publishedAt: data.pubDate ? new Date(data.pubDate) : MISSING_VALUES_EPISODE.publishedAt,
    downloadUrl: data.enclosure?.url || "",
    image30: null,
    image60: null,
    // TODO: Check this is the right size roughly
    image100: data["itunes:image"]?.href || null,
    image600: null,
    description: data.description || "",
    shouldDownload: false,
    rssId: extractRssId(data.guid),
    // `podcastId` is not part of the RSS response
  } satisfies RSSFeedEpisodeFields
})

export type ParsedLocalPodcastSchema = z.infer<typeof ToLocalPodcastSchema>
export type ParsedLocalEpisodeSchema = z.infer<typeof ToLocalEpisodeSchema>
