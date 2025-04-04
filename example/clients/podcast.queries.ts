import { useQuery } from "@tanstack/react-query"

import { fetchEpisodes, fetchPodcast } from "./podcast.fetch"
import { PodcastSearchResult } from "../types/podcast"

export function useFetchEpisodesQuery(id: string) {
  return useQuery({
    queryKey: ["episodes", id],
    queryFn: () => fetchEpisodes(id),
  })
}

export function useSearchPodcastsQuery(searchQuery: string) {
  return useQuery({
    queryKey: ["podcastSearch", searchQuery],
    queryFn: () => fetchPodcast(searchQuery),
    enabled: searchQuery.trim().length > 0,
    select: (data) => {
      if (!data?.results) return []
      return data.results.map((item: PodcastSearchResult) => ({
        ...item,
        // id: item.trackId?.toString() || item.collectionId?.toString() || Math.random().toString(),
        // title: item.trackName || item.collectionName || "Unknown Title",
        // author: item.artistName || "Unknown Author",
        // artworkUrl100: item.artworkUrl100,
      }))
    },
  })
}
