import { useMutation, useQueryClient } from "@tanstack/react-query"

import { fetchPodcastAndEpisodes } from "./itunes.fetch"
import { PURE_TOASTS } from "../components/toasts"
import { db, schema } from "../db/client"
import { SharedEpisodeFields, SharedPodcastFields } from "../types/db.types"
import { AppleEpisodeResponse } from "../types/purecast.types"
import {
  extractAndParseEpisodesFromItunesResponse,
  extractAndParsePodcastFromItunesResponse,
} from "../utils/podcasts.utils"

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

  const savedEpisodes = await db.insert(schema.episodesTable).values(
    episodes.map((episode) => {
      const id = Number(episode.appleId)
      const isValidId = !isNaN(id)

      return {
        ...episode,
        ...(isValidId ? { id } : {}), // If appleId is somehow not a number, use the auto-generated id
        podcastId: savedPodcast.id,
      } satisfies typeof schema.episodesTable.$inferInsert
    }),
  )
  return {
    savedPodcast,
    savedEpisodes,
  }
}

export function useSavePodcastMutation() {
  const queryClient = useQueryClient()

  const mutationData = useMutation({
    mutationFn: async ({ podcast, episodes }: { podcast: SharedPodcastFields; episodes: SharedEpisodeFields[] }) => {
      return await savePodcastAndEpisodes(podcast, episodes)
    },
    onSuccess: ({ savedPodcast, savedEpisodes }) => {
      // Invalidate and refetch saved podcasts query
      queryClient.invalidateQueries({ queryKey: ["savedPodcasts"] })
    },
  })

  const handleSavePodcast = async (podcastAppleId: string | null) => {
    let res: AppleEpisodeResponse | null = null

    try {
      res = await fetchPodcastAndEpisodes({ id: podcastAppleId })
    } catch (error) {
      console.error("Failed to fetch podcast and episodes:", error)
      PURE_TOASTS.error({
        message: "Failed to Save",
      })
      return
    }

    const episodes = extractAndParseEpisodesFromItunesResponse(res.results)
    const podcast = extractAndParsePodcastFromItunesResponse(res.results)

    try {
      const res = await mutationData.mutateAsync({ podcast, episodes })
      PURE_TOASTS.success({ message: "Podcast Added!" })

      return res
    } catch (error) {
      console.error("Failed to save podcast:", error)
      PURE_TOASTS.error({
        message: "Failed to Save",
      })
    }
  }

  return { handleSavePodcast, ...mutationData }
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
