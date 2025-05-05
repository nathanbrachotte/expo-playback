import { useMutation, useQueryClient } from "@tanstack/react-query"
import { eq } from "drizzle-orm"

import { fetchRssFeed } from "./rss.fetch"
import { extractEpisodesFromRssFeed } from "./rss.queries"
import { PURE_TOASTS } from "../components/toasts"
import { db, schema } from "../db/client"
import { SharedEpisodeFields, SharedPodcastFields } from "../types/db.types"
import { generateRssId } from "../utils/episodes.utils"

async function savePodcastAndEpisodes(podcast: SharedPodcastFields, episodes: Omit<SharedEpisodeFields, "">[]) {
  // TODO: transaction
  const [savedPodcast] = await db
    .insert(schema.podcastsTable)
    .values({
      id: podcast.appleId,
      author: podcast.author,
      description: podcast.description,
      image30: podcast.image30,
      image60: podcast.image60,
      image100: podcast.image100,
      image600: podcast.image600,
      title: podcast.title,
      appleId: podcast.appleId,
      rssFeedUrl: podcast.rssFeedUrl,
    } satisfies typeof schema.podcastsTable.$inferInsert)
    .returning()

  //! FIXME: What happens if two episodes have the same rssId (because of different podcasts)?
  const savedEpisodes = await db.insert(schema.episodesTable).values(
    episodes.map((episode) => {
      return {
        ...episode,
        rssId: generateRssId(savedPodcast.id, episode.rssId),
        podcastId: savedPodcast.id,
      } satisfies typeof schema.episodesTable.$inferInsert
    }),
  )
  return {
    savedPodcast,
    savedEpisodes,
  }
}

export function useSavePodcastMutation({ podcastId }: { podcastId: string }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["savePodcast", podcastId],
    mutationFn: async ({ podcast }: { podcast: SharedPodcastFields }) => {
      const res = await fetchRssFeed(podcast.rssFeedUrl)
      const rssEpisodes = extractEpisodesFromRssFeed(res).map((episode) => ({
        ...episode,
        podcastId: podcast.appleId,
      }))

      return await savePodcastAndEpisodes(podcast, rssEpisodes)
    },
    onError: (err) => {
      console.error("Failed to save podcast:", err)
      PURE_TOASTS.error({ message: "Failed to Save" })
    },
    onSuccess: ({ savedPodcast, savedEpisodes }) => {
      PURE_TOASTS.success({ message: "Podcast Added!" })
      // Invalidate and refetch saved podcasts query
      queryClient.invalidateQueries({ queryKey: ["savedPodcasts"] })
      queryClient.invalidateQueries({ queryKey: ["savedPodcast"] })
    },
  })
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
      queryClient.invalidateQueries({ queryKey: ["savedPodcast"] })
    },
    onError: () => {
      PURE_TOASTS.error({ message: "Failed to Remove Podcast" })
    },
  })
}
