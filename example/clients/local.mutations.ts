import { useMutation, useQueryClient } from "@tanstack/react-query"
import { eq } from "drizzle-orm"

import { validateRSSEpisodes, fetchAndValidateRssFeed } from "./rss.fetch"
import { PURE_TOASTS } from "../components/toasts"
import { drizzleClient, schema } from "../db/client"
import { SharedEpisodeFields, SharedPodcastFields } from "../types/db.types"
import { generateEpisodeId, generateRssId } from "../utils/episodes.utils"
import { deleteEpisodeAudioFile } from "expo-playback"

async function savePodcastAndEpisodes(
  podcast: SharedPodcastFields,
  episodes: SharedEpisodeFields[],
) {
  return await drizzleClient.transaction(async (tx) => {
    console.log("🚀 Starting transaction to save podcast:", podcast.title)

    try {
      const [savedPodcast] = await tx
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

      console.log("✅ Podcast saved successfully:", savedPodcast.id)

      for (const episode of episodes) {
        const rssId = generateRssId(savedPodcast.id, episode.rssId)
        const id = generateEpisodeId(
          savedPodcast.id,
          episode.publishedAt,
          episode.rssId || undefined,
        )

        console.log("💾 Saving episode:", id)
        console.log("💾 Saving episode rssId:", rssId)

        await tx
          .insert(schema.episodesTable)
          .values({
            ...episode,
            rssId,
            episodeRssId: episode.rssId,
            podcastId: savedPodcast.id,
          } satisfies typeof schema.episodesTable.$inferInsert)
          .onConflictDoUpdate({
            target: [schema.episodesTable.rssId],
            set: {
              title: episode.title,
              description: episode.description,
              image30: episode.image30,
              image60: episode.image60,
              image100: episode.image100,
              image600: episode.image600,
              publishedAt: episode.publishedAt,
              duration: episode.duration,
              downloadUrl: episode.downloadUrl,
            },
          })
      }

      console.log("✅ Episodes saved successfully:", episodes.length, "episodes")

      return {
        savedPodcast,
        savedEpisodes: episodes.length,
      }
    } catch (error) {
      console.error("❌ Transaction failed:", error)
      throw error
    }
  })
}

export function useSavePodcastMutation({ podcastId }: { podcastId: string }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["savePodcast", podcastId],
    mutationFn: async ({ podcast }: { podcast: SharedPodcastFields }) => {
      // Fetch Feed + validate Podcast
      const res = await fetchAndValidateRssFeed(podcast.rssFeedUrl)
      // Validate Episodes
      const rssEpisodes = validateRSSEpisodes(res).map((episode) => ({
        ...episode,
        podcastId: podcast.appleId,
      }))

      return await savePodcastAndEpisodes(podcast, rssEpisodes)
    },
    onError: (err) => {
      console.error("Failed to save podcast:", podcastId)
      console.log("🚀 ~ useSavePodcastMutation ~ err:", err)
      PURE_TOASTS.error({ message: "Failed to save" })
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
      const episodeIds = await drizzleClient
        .select({ id: schema.episodesTable.id })
        .from(schema.episodesTable)
        .where(eq(schema.episodesTable.podcastId, Number(podcastId)))
      // Can not be in transaction since it happens on the native side
      for (const episodeId of episodeIds) {
        await deleteEpisodeAudioFile(episodeId.id)
      }

      await drizzleClient.transaction(async (tx) => {
        // Then delete episodes
        await tx
          .delete(schema.episodesTable)
          .where(eq(schema.episodesTable.podcastId, Number(podcastId)))
        // Then delete the podcast
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

export function useDeleteEpisodeMetadataAndAudioFileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (episodeId: number) => {
      await deleteEpisodeAudioFile(episodeId)
    },
    onSuccess: (_, episodeId) => {
      PURE_TOASTS.success({ message: "Download removed!" })
      // Invalidate any queries that might be using this episode's metadata
      queryClient.invalidateQueries({ queryKey: ["episodeMetadata", episodeId] })
      queryClient.invalidateQueries({ queryKey: ["savedEpisodes"] })
      queryClient.invalidateQueries({ queryKey: ["episode"] })
    },
    onError: () => {
      PURE_TOASTS.error({ message: "Failed to remove download" })
    },
  })
}
