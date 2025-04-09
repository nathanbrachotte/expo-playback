import { useMutation, useQueryClient } from "@tanstack/react-query"

import { db, schema } from "../db/client"
import { SharedEpisodeFields, SharedPodcastFields } from "../types/db"

async function savePodcastAndEpisodes(podcast: SharedPodcastFields, episodes: SharedEpisodeFields[]) {
  const [savedPodcast] = await db
    .insert(schema.podcastsTable)
    .values({
      author: podcast.author,
      createdAt: new Date(),
      description: "",
      image: podcast.image,
      title: podcast.title,
      updatedAt: new Date(),
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
