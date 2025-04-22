import { z } from "zod"

import { SharedEpisodeFields, SharedPodcastFields } from "../types/db.types"

export const ToLocalPodcastSchema = z
  .object({
    artistName: z.string(),
    collectionName: z.string(),
    trackId: z.number(),
    artworkUrl100: z.string(),
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
        image: data.artworkUrl100,
        description: "",
        //? id should be added manually when needed. Or should it?
      }) satisfies Omit<SharedPodcastFields, "id">,
  )

export type ParsedLocalPodcastSchema = z.infer<typeof ToLocalPodcastSchema>

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
    trackTimeMillis: z.number(),
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
        image: artworkUrl600 || artworkUrl160 || artworkUrl100 || artworkUrl60 || "",
        publishedAt: new Date(releaseDate),
        duration: trackTimeMillis,
        shouldDownload: false,
        downloadUrl: episodeUrl || "",
        podcastId: collectionId,
        appleId: trackId.toString(),
      } satisfies Omit<SharedEpisodeFields, "id">
    },
  )
