import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { desc, sql } from "drizzle-orm"
import { useLiveQuery } from "drizzle-orm/expo-sqlite"

import { drizzleClient, schema } from "../db/client"
import { episodeMetadatasTable, episodesTable, podcastsTable } from "../db/schema"
import { useNativeSaveLiveQuery } from "../db/useNativeSaveLiveQuery"

export function useLocalPodcastsQuery() {
  return useQuery({
    queryKey: ["savedPodcasts"],
    queryFn: async () => {
      const podcasts = await drizzleClient.select().from(schema.podcastsTable)
      return podcasts
    },
  })
}

export async function getPodcastById(id: string | null) {
  if (!id) {
    return null
  }

  const res = await drizzleClient
    .select()
    .from(schema.podcastsTable)
    .where(sql`id = ${id}`)

  if (res.length === 0) {
    return null
  }

  return res[0]
}

export function useGetLocalPodcastQuery(id: string | null) {
  return useQuery({
    queryKey: ["savedPodcast", id],
    queryFn: () => getPodcastById(id),
    enabled: !!id,
  })
}

async function getEpisodesByPodcastId(podcastId: string | null) {
  if (!podcastId) {
    return null
  }

  const res = await drizzleClient
    .select()
    .from(schema.episodesTable)
    .where(sql`${episodesTable.podcastId} = ${podcastId}`)

  return res
}

async function getEpisodesWithPodcastAndMetadataByPodcastId(podcastId: string | null) {
  if (!podcastId) {
    return null
  }

  const res = await drizzleClient
    .select({
      episode: {
        ...episodesTable,
      },
      podcast: {
        ...podcastsTable,
      },
      episodeMetadata: {
        ...episodeMetadatasTable,
      },
    })
    .from(episodesTable)
    .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
    .leftJoin(episodeMetadatasTable, sql`${episodesTable.id} = ${episodeMetadatasTable.episodeId}`)
    .where(sql`${episodesTable.podcastId} = ${podcastId}`)
    .orderBy(desc(episodesTable.publishedAt))
  console.log("🚀 ~ getEpisodesWithPodcastAndMetadataByPodcastId ~ res:", res)
  return res
}

export function useGetLocalEpisodesWithPodcastAndMetadataByPodcastIdLiveQuery(podcastId: string | null) {
  return useLiveQuery(
    drizzleClient
      .select({
        episode: {
          ...episodesTable,
        },
        podcast: {
          ...podcastsTable,
        },
        episodeMetadata: {
          ...episodeMetadatasTable,
        },
      })
      .from(episodesTable)
      .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
      .innerJoin(episodeMetadatasTable, sql`${episodesTable.id} = ${episodeMetadatasTable.episodeId}`)
      .orderBy(desc(episodesTable.publishedAt))
      .where(sql`${episodesTable.podcastId} = ${podcastId}`),
    [podcastId],
  )
}

export function useGetLocalEpisodesByPodcastIdQuery(podcastId: string | null) {
  console.log("🚀 ~ useGetLocalEpisodesByPodcastIdQuery ~ podcastId:", podcastId)
  return useQuery({
    queryKey: ["savedEpisodes", podcastId],
    queryFn: () => getEpisodesWithPodcastAndMetadataByPodcastId(podcastId),
    enabled: !!podcastId,
  })
}

export const episodeWithExtrasByIdDbQuery = (episodeId: string | null) =>
  drizzleClient
    .select({
      episode: {
        ...episodesTable,
      },
      podcast: {
        ...podcastsTable,
      },
      episodeMetadata: {
        ...episodeMetadatasTable,
      },
    })
    .from(episodesTable)
    .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
    .leftJoin(episodeMetadatasTable, sql`${episodesTable.id} = ${episodeMetadatasTable.episodeId}`)
    .where(sql`${episodesTable.id} = ${episodeId}`)

export async function getEpisodeWithPodcastByExternalId(episodeId: string | null) {
  if (!episodeId) {
    return null
  }

  const res = await episodeWithExtrasByIdDbQuery(episodeId)

  if (res.length !== 1) {
    return null
  }

  return res[0]
}

export async function getEpisodeWithPodcastById(episodeId: string | null) {
  if (!episodeId) {
    return null
  }

  const res = await episodeWithExtrasByIdDbQuery(episodeId)

  if (res.length !== 1) {
    return null
  }

  return res[0]
}

export function useGetLiveLocalEpisodeQuery({ id }: { id: string | null }) {
  return useLiveQuery(episodeWithExtrasByIdDbQuery(id), [id])
}

export const episodeMetadataByIdDbQuery = (episodeId: number) =>
  drizzleClient
    .select({
      episodeMetadata: {
        ...episodeMetadatasTable,
      },
    })
    .from(episodeMetadatasTable)
    .where(sql`${episodeMetadatasTable.episodeId} = ${episodeId}`)

export function useGetLiveLocalEpisodeMetadataQuery(id: number) {
  return useNativeSaveLiveQuery(episodeMetadataByIdDbQuery(id), ["episode_metadata"])
}

// Join episodes with podcasts to get podcast title, and order by published_at desc
export const useAllEpisodesQuery = () => {
  return useLiveQuery(
    drizzleClient
      .select({
        episode: {
          ...episodesTable,
        },
        podcast: {
          ...podcastsTable,
        },
      })
      .from(episodesTable)
      .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
      .orderBy(desc(episodesTable.publishedAt)),
  )
}

export function useAllDownloadedEpisodesLiveQuery() {
  return useLiveQuery(
    drizzleClient
      .select({
        episode: {
          ...episodesTable,
        },
        podcast: {
          ...podcastsTable,
        },
        episodeMetadata: {
          ...episodeMetadatasTable,
        },
      })
      .from(episodesTable)
      .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
      .leftJoin(episodeMetadatasTable, sql`${episodesTable.id} = ${episodeMetadatasTable.episodeId}`)
      .orderBy(desc(episodesTable.publishedAt)),
  )
}

async function getAllDownloadedEpisodes({ pageParam = 0 }: { pageParam?: number }) {
  const limit = 20
  const offset = pageParam * limit
  const res = await drizzleClient
    .select({
      episode: {
        ...episodesTable,
      },
      podcast: {
        ...podcastsTable,
      },
      episodeMetadata: {
        ...episodeMetadatasTable,
      },
    })
    .from(episodesTable)
    .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
    .leftJoin(episodeMetadatasTable, sql`${episodesTable.id} = ${episodeMetadatasTable.episodeId}`)
    .orderBy(desc(episodesTable.publishedAt))
    .limit(limit)
    .offset(offset)
  return res
}

export function useAllDownloadedEpisodesQuery() {
  return useInfiniteQuery({
    queryKey: ["allDownloadedEpisodes"],
    queryFn: getAllDownloadedEpisodes,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // Assuming lastPage is an array of episodes
      // If lastPage has less than 20 items, it means there are no more pages
      if (lastPage.length < 20) {
        return undefined
      }
      // Otherwise, increment the page number (which acts as the offset multiplier)
      return allPages.length
    },
  })
}
