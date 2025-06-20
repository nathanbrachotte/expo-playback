import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

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

const TEST_SYNC_MODE_ON = false
const LOGS_ON = false

export async function insertEpisodes(episodes: RSSFeedEpisodeFields[], podcastId: number) {
  console.log(
    `🚀 Starting transaction to insert ${episodes.length} episodes for podcast ${podcastId}`,
  )

  try {
    await drizzleClient.transaction(async (tx) => {
      for (const episode of episodes) {
        if (LOGS_ON) {
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
  } catch (error) {
    console.error("Error fetching new episodes from all podcasts:", error)
    throw error
  }

  for (const podcast of savedPodcasts) {
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
    }
  }
}
