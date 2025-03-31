import { useMutation, useQueryClient } from "@tanstack/react-query"

import { db, schema } from "../db/client"
import { SearchResult } from "../types/podcast"

const savePodcastToStorage = async (podcast: SearchResult) => {
  await db.insert(schema.podcasts).values({
    title: podcast.title,
    description: "",
    image: podcast.artworkUrl100,
    createdAt: new Date(),
    updatedAt: new Date(),
  } satisfies typeof schema.podcasts.$inferInsert)
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
