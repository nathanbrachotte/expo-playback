import { useQuery } from "@tanstack/react-query"

import { fetchEpisodes, fetchPodcast } from "./podcast.fetch"
import { db, schema } from "../db/client"
import { PodcastSearchResult } from "../types/podcast"

export function useSavedPodcasts() {
  return useQuery({
    queryKey: ["savedPodcasts"],
    queryFn: async () => {
      const podcasts = await db.select().from(schema.podcastsTable)
      return podcasts
    },
  })
}

export function useFetchEpisodes(id: string) {
  return useQuery({
    queryKey: ["episodes", id],
    queryFn: () => fetchEpisodes(id),
  })
}

export function useSearchPodcasts(searchQuery: string) {
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
