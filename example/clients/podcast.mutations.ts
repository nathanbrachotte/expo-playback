import { useMutation, useQueryClient } from "@tanstack/react-query"

import { db, schema } from "../db/client"
import { PodcastSearchResult } from "../types/podcast"

const savePodcastToStorage = async (podcast: PodcastSearchResult) => {
  return await db.insert(schema.podcastsTable).values({
    author: podcast.artistName,
    createdAt: new Date(),
    description: "",
    image: podcast.artworkUrl100,
    title: podcast.trackName,
    updatedAt: new Date(),
  } satisfies typeof schema.podcastsTable.$inferInsert)
}

export function useSavePodcast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: savePodcastToStorage,
    onSuccess: (savedPodcast) => {
      // Invalidate and refetch saved podcasts query
      queryClient.invalidateQueries({ queryKey: ["savedPodcasts"] })
    },
  })
}

export function useRemovePodcast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (podcastId: string) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      return podcastId
    },
    onSuccess: () => {
      // Invalidate and refetch saved podcasts query
      queryClient.invalidateQueries({ queryKey: ["savedPodcasts"] })
    },
  })
}
