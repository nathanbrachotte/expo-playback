import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { eq, isNotNull } from "drizzle-orm"

import { validateRSSEpisodes, fetchAndValidateRssFeed } from "./rss.fetch"
import type { RssFeed } from "./rss.fetch"
import { drizzleClient } from "../db/client"
import { episodesTable, podcastsTable } from "../db/schema"
import { RSSFeedEpisodeFields } from "../types/db.types"

export function useGetRssEpisodesQuery(feedUrl: string | null) {
  return useQuery({
    queryKey: ["rssEpisodes", feedUrl],
    queryFn: () => fetchAndValidateRssFeed(feedUrl),
    select: (data: RssFeed) => validateRSSEpisodes(data),
    enabled: !!feedUrl,
  })
}

export function useGetRssEpisodeQuery({
  feedUrl,
  episodeId,
}: {
  feedUrl: string | null
  episodeId: string | null
}) {
  return useQuery({
    queryKey: ["rssEpisode", feedUrl, episodeId],
    queryFn: () => fetchAndValidateRssFeed(feedUrl),
    select: (data: RssFeed) => {
      const episode = validateRSSEpisodes(data).find((episode) => episode.rssId === episodeId)

      if (!episode) {
        return null
      }
      return episode
    },
    enabled: !!feedUrl && !!episodeId,
  })
}

export function useFetchNewEpisodesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: fetchNewEpisodesFromAllPodcasts,
    onSuccess: () => {
      // Invalidate and refetch all episodes queries to show new episodes
      queryClient.invalidateQueries({ queryKey: ["allEpisodes"] })
      queryClient.invalidateQueries({ queryKey: ["savedEpisodes"] })
      queryClient.invalidateQueries({ queryKey: ["latestEpisode"] })
    },
    onError: (error) => {
      console.error("Error fetching new episodes:", error)
    },
  })
}

export function useFetchNewEpisodesFromOnePodcastMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: fetchNewEpisodesFromOnePodcast,
    onSuccess: () => {
      // Invalidate and refetch all episodes queries to show new episodes
      queryClient.invalidateQueries({ queryKey: ["allEpisodes"] })
      queryClient.invalidateQueries({ queryKey: ["savedEpisodes"] })
      queryClient.invalidateQueries({ queryKey: ["latestEpisode"] })
    },
    onError: (error) => {
      console.error("Error fetching new episodes from podcast:", error)
    },
  })
}

const TEST_SYNC_MODE_ON = false
const DEBUG_LOGS_ENABLED = process.env.EXPO_PUBLIC_SYNC_DEBUG_LOGS_ENABLED === "true"

export async function insertEpisodes(episodes: RSSFeedEpisodeFields[], podcastId: number) {
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

export async function fetchNewEpisodesFromOnePodcast(podcastId: number) {
  let podcast: { id: number; title: string; rssFeedUrl: string | null } | null = null

  try {
    // Get the specific podcast that has RSS feed URL
    const podcasts = await drizzleClient
      .select({
        id: podcastsTable.id,
        title: podcastsTable.title,
        rssFeedUrl: podcastsTable.rssFeedUrl,
      })
      .from(podcastsTable)
      .where(eq(podcastsTable.id, podcastId))

    podcast = podcasts[0] || null

    if (!podcast) {
      throw new Error(`Podcast with ID ${podcastId} not found`)
    }

    if (!podcast.rssFeedUrl) {
      throw new Error(`Podcast ${podcast.title} does not have an RSS feed URL`)
    }
  } catch (error) {
    console.error(`Error fetching podcast ${podcastId}:`, error)
    throw error
  }

  try {
    // Fetch RSS feed for this podcast
    const rssFeed = await fetchAndValidateRssFeed(podcast.rssFeedUrl)
    const allEpisodes = validateRSSEpisodes(rssFeed)

    // Filter out all episodes that were release more than a month ago
    const newEpisodes = allEpisodes.filter((episode) => {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      return episode.publishedAt > oneMonthAgo
    })

    // Insert
    await insertEpisodes(newEpisodes, podcast.id)
  } catch (error) {
    console.error(`Error fetching episodes for podcast ${podcast.title}:`, error)
    throw error
  }
}

export async function fetchNewEpisodesFromAllPodcasts() {
  let savedPodcasts: { id: number; title: string; rssFeedUrl: string | null }[] = []

  try {
    // Get all saved podcasts that have RSS feed URLs
    savedPodcasts = await drizzleClient
      .select({
        id: podcastsTable.id,
        title: podcastsTable.title,
        rssFeedUrl: podcastsTable.rssFeedUrl,
      })
      .from(podcastsTable)
      .where(isNotNull(podcastsTable.rssFeedUrl))
  } catch (error) {
    console.error("Error fetching new episodes from all podcasts:", error)
    throw error
  }

  DEBUG_LOGS_ENABLED &&
    console.log(`📻 Processing ${savedPodcasts.length} podcasts for new episodes`)

  for (let i = 0; i < savedPodcasts.length; i++) {
    const podcast = savedPodcasts[i]

    try {
      DEBUG_LOGS_ENABLED &&
        console.log(`🎧 Processing podcast ${i + 1}/${savedPodcasts.length}: ${podcast.title}`)

      // Fetch RSS feed for this podcast
      const rssFeed = await fetchAndValidateRssFeed(podcast.rssFeedUrl)
      const allEpisodes = validateRSSEpisodes(rssFeed)

      // Filter out all episodes that were release more than a month ago
      const newEpisodes = allEpisodes.filter((episode) => {
        const oneMonthAgo = new Date()
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
        return episode.publishedAt > oneMonthAgo
      })

      // Insert episodes
      if (newEpisodes.length > 0) {
        await insertEpisodes(newEpisodes, podcast.id)
        DEBUG_LOGS_ENABLED &&
          console.log(
            `✅ Successfully processed ${newEpisodes.length} new episodes for ${podcast.title}`,
          )
      } else {
        DEBUG_LOGS_ENABLED && console.log(`ℹ️  No new episodes found for ${podcast.title}`)
      }
    } catch (error) {
      console.error(`❌ Error fetching episodes for podcast ${podcast.title}:`, error)
    }
  }

  DEBUG_LOGS_ENABLED && console.log(`🎉 Finished processing all podcasts`)
}
