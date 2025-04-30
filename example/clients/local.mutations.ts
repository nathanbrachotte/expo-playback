import { useMutation, useQueryClient } from "@tanstack/react-query"

import { fetchPodcastAndEpisodes } from "./itunes.fetch"
import { fetchRssFeed } from "./rss.fetch"
import { extractEpisodesFromRssFeed } from "./rss.queries"
import { PURE_TOASTS } from "../components/toasts"
import { db, schema } from "../db/client"
import { SharedEpisodeFields, SharedPodcastFields } from "../types/db.types"
import { AppleEpisodeResponse } from "../types/purecast.types"
import {
  extractAndParseEpisodesFromItunesResponse,
  extractAndParsePodcastFromItunesResponse,
} from "../utils/podcasts.utils"
import { getPodcastById } from "./local.queries"
import { eq } from "drizzle-orm"

async function savePodcastAndEpisodes(podcast: SharedPodcastFields, episodes: Omit<SharedEpisodeFields, "">[]) {
  const [savedPodcast] = await db
    .insert(schema.podcastsTable)
    .values({
      id: podcast.appleId,
      author: podcast.author,
      description: podcast.description,
      image: podcast.image,
      title: podcast.title,
      appleId: podcast.appleId,
      rssFeedUrl: podcast.rssFeedUrl,
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
    mutationFn: async ({ podcast }: { podcast: SharedPodcastFields }) => {
      const res = await fetchRssFeed(podcast.rssFeedUrl)
      const rssEpisodes = extractEpisodesFromRssFeed(res).map((episode) => ({
        ...episode,
        podcastId: podcast.appleId,
      }))

      return await savePodcastAndEpisodes(podcast, rssEpisodes)
    },
    onSuccess: ({ savedPodcast, savedEpisodes }) => {
      // Invalidate and refetch saved podcasts query
      queryClient.invalidateQueries({ queryKey: ["savedPodcasts"] })
    },
  })

  const handleSavePodcast = async (podcastAppleId: string | null) => {
    const podcast = await getPodcastById(podcastAppleId)

    if (!podcast) {
      PURE_TOASTS.error({
        message: "Podcast not found",
      })
      return
    }

    try {
      const res = await mutationData.mutateAsync({ podcast })
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
      await db.transaction(async (tx) => {
        await tx.delete(schema.episodesTable).where(eq(schema.episodesTable.podcastId, Number(podcastId)))
        await tx.delete(schema.podcastsTable).where(eq(schema.podcastsTable.id, Number(podcastId)))
      })
    },
    onSuccess: () => {
      PURE_TOASTS.success({ message: "Podcast Removed!" })
      queryClient.invalidateQueries({ queryKey: ["savedPodcasts"] })
    },
    onError: () => {
      PURE_TOASTS.error({ message: "Failed to Remove Podcast" })
    },
  })
}
