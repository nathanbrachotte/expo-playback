import { useMutation, useQueryClient } from "@tanstack/react-query"

import { SearchResult } from "../types/podcast"

// This would typically come from your database service
interface SavedPodcast extends SearchResult {
  savedAt: string
}

// In a real app, this would be your database service
const savePodcastToStorage = async (podcast: SearchResult): Promise<SavedPodcast> => {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  // In a real app, this would be your database call
  const savedPodcast: SavedPodcast = {
    ...podcast,
    savedAt: new Date().toISOString(),
  }

  return savedPodcast
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
