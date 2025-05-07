import { useQuery } from "@tanstack/react-query"
import { desc, sql } from "drizzle-orm"
import { useLiveQuery } from "drizzle-orm/expo-sqlite"

import { db, schema } from "../db/client"
import { episodeMetadatasTable, episodesTable, podcastsTable } from "../db/schema"
import { useNativeSaveLiveQuery } from "../db/useNativeSaveLiveQuery"

export function useLocalPodcastsQuery() {
  return useQuery({
    queryKey: ["savedPodcasts"],
    queryFn: async () => {
      const podcasts = await db.select().from(schema.podcastsTable)
      return podcasts
    },
  })
}

export async function getPodcastById(id: string | null) {
  if (!id) {
    return null
  }

  const res = await db
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

  const res = await db
    .select()
    .from(schema.episodesTable)
    .where(sql`${episodesTable.podcastId} = ${podcastId}`)

  return res
}

export function useGetLocalEpisodesByPodcastIdQuery(podcastId: string | null) {
  return useQuery({
    queryKey: ["savedEpisodes", podcastId],
    queryFn: () => getEpisodesByPodcastId(podcastId),
    enabled: !!podcastId,
  })
}

export const episodeWithPodcastByIdDbQuery = (episodeId: string | null) =>
  db
    .select({
      episode: {
        ...episodesTable,
      },
      podcast: {
        ...podcastsTable,
      },
    })
    .from(episodesTable)
    .where(sql`${episodesTable.id} = ${episodeId}`)
    .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)

export async function getEpisodeWithPodcastByExternalId(episodeId: string | null) {
  if (!episodeId) {
    return null
  }

  const res = await episodeWithPodcastByIdDbQuery(episodeId)

  if (res.length !== 1) {
    return null
  }

  return res[0]
}

export async function getEpisodeWithPodcastById(episodeId: string | null) {
  if (!episodeId) {
    return null
  }

  const res = await episodeWithPodcastByIdDbQuery(episodeId)

  if (res.length !== 1) {
    return null
  }

  return res[0]
}

export function useGetLiveLocalEpisodeQuery({ id }: { id: string | null }) {
  return useLiveQuery(episodeWithPodcastByIdDbQuery(id), [id])
}

export const episodeMetadataByIdDbQuery = (episodeId: number) =>
  db
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
    db
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
