import { useQuery } from "@tanstack/react-query"
import { z } from "zod"

import { fetchPodcastAndEpisodes, fetchPodcast } from "./itunes.fetch"
import { SharedEpisodeFields, SharedPodcastFields } from "../types/db"
import { AppleEpisodeResponse } from "../utils/podcasts.types"

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
    contentAdvisoryRating: z.string(),
    collectionExplicitness: z.string(),
    trackExplicitness: z.string(),
    collectionPrice: z.number(),
    trackPrice: z.number(),
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
      }) satisfies SharedPodcastFields,
  )

export const ToLocalEpisodeSchema = z
  .object({
    artistIds: z.array(z.string()).optional(),
    artworkUrl160: z.string(),
    artworkUrl60: z.string(),
    artworkUrl600: z.string(),
    closedCaptioning: z.string().optional(),
    collectionId: z.number(),
    collectionName: z.string(),
    collectionViewUrl: z.string(),
    contentAdvisoryRating: z.string(),
    country: z.string(),
    description: z.string(),
    episodeContentType: z.string(),
    episodeFileExtension: z.string(),
    episodeGuid: z.string(),
    episodeUrl: z.string(),
    feedUrl: z.string(),
    // TODO: Fix this
    genres: z.any().optional(),
    kind: z.literal("podcast-episode"),
    previewUrl: z.string(),
    releaseDate: z.string(),
    shortDescription: z.string(),
    trackId: z.number(),
    trackName: z.string(),
    trackTimeMillis: z.number(),
    trackViewUrl: z.string(),
    wrapperType: z.literal("podcastEpisode"),
  })
  .transform((data) => {
    return {
      title: data.trackName,
      description: data.shortDescription,
      image: data.artworkUrl600,
      publishedAt: new Date(data.releaseDate),
      duration: data.trackTimeMillis,
      shouldDownload: false,
      downloadUrl: data.episodeUrl,
      podcastId: data.collectionId,
    } satisfies SharedEpisodeFields
  })

export function useFetchPodcastQuery(id: string | null) {
  return useQuery({
    queryKey: ["podcast", id],
    queryFn: () => fetchPodcastAndEpisodes(id),
    select: (data: AppleEpisodeResponse) => {
      // The query also returns the podcast's data
      const foundPodcast = data.results.find((episode) => episode.wrapperType === "track")

      if (!foundPodcast) {
        throw new Error("Podcast not found")
      }

      return ToLocalPodcastSchema.parse(foundPodcast)
    },
    enabled: !!id,
  })
}

export function useFetchEpisodesQuery(id: string | null) {
  return useQuery({
    queryKey: ["episodes", id],
    queryFn: () => fetchPodcastAndEpisodes(id),
    select: (data: AppleEpisodeResponse) => {
      // The query also returns the podcast's data
      return {
        ...data,
        results: data.results
          .filter((episode) => episode.wrapperType === "podcastEpisode")
          .map((episode) => ToLocalEpisodeSchema.parse(episode)),
      }
    },
    enabled: !!id,
  })
}

export function useSearchPodcastsQuery(searchQuery: string | null) {
  return useQuery({
    queryKey: ["podcastSearch", searchQuery],
    queryFn: () => fetchPodcast(searchQuery),
    enabled: !!searchQuery && searchQuery.trim().length > 0,
    select: (data) => {
      if (!data?.results) return []
      return data.results.map((item) => ToLocalPodcastSchema.parse(item))
    },
  })
}
