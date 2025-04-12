import { useQuery } from "@tanstack/react-query"

import { fetchPodcastAndEpisodes, searchPodcast } from "./itunes.fetch"
import { ToLocalEpisodeSchema, ToLocalPodcastSchema } from "./schemas"
import { AppleEpisodeResponse } from "../types/purecast.types"

export function useGetItunesPodcastQuery(id: string | null) {
  return useQuery({
    queryKey: ["podcast", id],
    queryFn: () => fetchPodcastAndEpisodes({ id }),
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

export function useGetItunesEpisodesQuery(podcastId: string | null) {
  return useQuery({
    queryKey: ["episodes", podcastId],
    queryFn: () => fetchPodcastAndEpisodes({ id: podcastId }),
    select: (data: AppleEpisodeResponse) => {
      // The query also returns the podcast's data
      return {
        ...data,
        episodes: data.results
          .filter((episode) => episode.wrapperType === "podcastEpisode")
          .map((episode) => ToLocalEpisodeSchema.parse(episode)),
        podcast: ToLocalPodcastSchema.parse(data.results.find((episode) => episode.wrapperType === "track")),
      }
    },
    enabled: !!podcastId,
  })
}

export function useGetItunesEpisodeQuery(episodeId: string | null) {
  console.log("🚀 ~ useGetItunesEpisodeQuery ~ episodeId:", episodeId)
  return useQuery({
    queryKey: ["episode", episodeId],
    // TODO: Use actual query
    queryFn: () => fetchPodcastAndEpisodes({ id: episodeId }),
    // queryFn: () => fetchSingleEpisode(episodeId),
    select: (data) => {
      if (!episodeId) {
        return null
      }

      const foundEpisode = data.results.find((episode) => episode.trackId.toString() === episodeId)
      console.log("🚀 ~ useGetItunesEpisodeQuery ~ foundEpisode:", foundEpisode)

      if (!foundEpisode) {
        return null
      }

      const parsedEpisode = ToLocalEpisodeSchema.safeParse(foundEpisode)
      if (!parsedEpisode.success) {
        throw new Error("Error parsing found episode result")
      }

      return {
        episode: parsedEpisode.data,
        podcast: ToLocalPodcastSchema.parse(data.results.find((episode) => episode.wrapperType === "track")),
      }
    },
    enabled: !!episodeId,
  })
}

export function useSearchItunesPodcastsQuery(searchQuery: string | null) {
  return useQuery({
    queryKey: ["podcastSearch", searchQuery],
    queryFn: () => searchPodcast(searchQuery),
    select: (data) => {
      if (!data?.results) return []
      return data.results.map((item) => ToLocalPodcastSchema.parse(item))
    },
    enabled: !!searchQuery && searchQuery.trim().length > 0,
  })
}
