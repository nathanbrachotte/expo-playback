import { useMutation, useQueryClient } from "@tanstack/react-query"
import { eq } from "drizzle-orm"

import { validateRSSEpisodes, fetchAndValidateRssFeed } from "./rss.fetch"
import { PURE_TOASTS } from "../components/toasts"
import { drizzleClient, schema } from "../db/client"
import { SharedEpisodeFields, SharedPodcastFields } from "../types/db.types"
import { generateEpisodeId, generateRssId } from "../utils/episodes.utils"
import { deleteEpisodeAudioFileAndMetadata } from "expo-playback"
import { episodesTable } from "../db/schema"

export async function savePodcast(podcast: SharedPodcastFields) {
  const [savedPodcast] = await drizzleClient
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

  return savedPodcast
}

export async function saveEpisodes(podcastId: number, episodes: Omit<SharedEpisodeFields, "">[]) {
  const savedEpisodes = await drizzleClient.insert(schema.episodesTable).values(
    episodes.map((episode) => {
      return {
        ...episode,
        id: generateEpisodeId(podcastId, episode.publishedAt),
        rssId: generateRssId(podcastId, episode.rssId),
        podcastId,
      } satisfies typeof schema.episodesTable.$inferInsert
    }),
  )

  return savedEpisodes
}

async function savePodcastAndEpisodes(
  podcast: SharedPodcastFields,
  episodes: Omit<SharedEpisodeFields, "">[],
) {
  const savedPodcast = await savePodcast(podcast)
  const savedEpisodes = await saveEpisodes(savedPodcast.id, episodes)

  return {
    savedPodcast,
    savedEpisodes,
  }
}

const DEBUG_LOGS_ENABLED = process.env.DEBUG_LOGS_ENABLED === "true"
const TEST_SYNC_MODE_ON = false

export async function saveEpisodesTransaction(
  podcastId: number,
  episodes: Omit<SharedEpisodeFields, "">[],
) {
  if (DEBUG_LOGS_ENABLED) {
    console.log(
      `🚀 Starting transaction to insert ${episodes.length} episodes for podcast ${podcastId}`,
    )
  }
  try {
    await drizzleClient.transaction(async (tx) => {
      for (const episode of episodes) {
        if (DEBUG_LOGS_ENABLED) {
          console.log(`📋 Inserting episode: ${episode.title}`)
        }

        await tx
          .insert(episodesTable)
          .values({
            ...episode,
            podcastId,
          })
          .onConflictDoUpdate({
            target: [episodesTable.rssId],
            set: {
              ...episode,
              ...(TEST_SYNC_MODE_ON ? { duration: Math.random() * 1000000 } : {}),
            },
          })
      }
    })
  } catch (error) {
    console.error("❌ Transaction failed:", error)
    throw error
  }
}

export function useSavePodcastMutation({ podcastId }: { podcastId: string }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["savePodcast", podcastId],
    mutationFn: async ({ podcast }: { podcast: SharedPodcastFields }) => {
      const res = await fetchAndValidateRssFeed(podcast.rssFeedUrl)
      const rssEpisodes = validateRSSEpisodes(res).map((episode) => ({
        ...episode,
        podcastId: podcast.appleId,
      }))

      return await savePodcastAndEpisodes(podcast, rssEpisodes)
    },
    onError: (err) => {
      console.error("Failed to save podcast:", podcastId)
      if (false) {
        console.log("🚀 ~ useSavePodcastMutation ~ err:", err)
      }
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
        await deleteEpisodeAudioFileAndMetadata(episodeId.id)
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
      await deleteEpisodeAudioFileAndMetadata(episodeId)
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
