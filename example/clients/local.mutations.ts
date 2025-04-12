import { useMutation, useQueryClient } from "@tanstack/react-query"

import { db, schema } from "../db/client"
import { SharedEpisodeFields, SharedPodcastFields } from "../types/db.types"

async function savePodcastAndEpisodes(podcast: SharedPodcastFields, episodes: SharedEpisodeFields[]) {
  const [savedPodcast] = await db
    .insert(schema.podcastsTable)
    .values({
      id: podcast.appleId,
      author: podcast.author,
      description: podcast.description,
      image: podcast.image,
      title: podcast.title,
      appleId: podcast.appleId,
    } satisfies typeof schema.podcastsTable.$inferInsert)
    .returning()

  await db.insert(schema.episodesTable).values(
    episodes.map((episode) => ({
      ...episode,
      podcastId: savedPodcast.id,
    })),
  )
}

export function useSavePodcastMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ podcast, episodes }: { podcast: SharedPodcastFields; episodes: SharedEpisodeFields[] }) => {
      return await savePodcastAndEpisodes(podcast, episodes)
    },
    onSuccess: (savedPodcast) => {
      // Invalidate and refetch saved podcasts query
      queryClient.invalidateQueries({ queryKey: ["savedPodcasts"] })
    },
  })
}

export function useRemovePodcastMutation() {
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
