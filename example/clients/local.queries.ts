import { useQuery } from "@tanstack/react-query"
import { desc, sql } from "drizzle-orm"
import { useLiveQuery } from "drizzle-orm/expo-sqlite"

import { db, schema } from "../db/client"
import { episodesTable, podcastsTable } from "../db/schema"

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

export const episodeWithPodcastByIdDbQuery = (id: string | null) =>
  db
    .select({
      episode: {
        ...episodesTable,
      },
      podcast: {
        title: podcastsTable.title,
        id: podcastsTable.id,
        appleId: podcastsTable.appleId,
      },
    })
    .from(episodesTable)
    .where(sql`${episodesTable.id} = ${id}`)
    .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)

export async function getEpisodeWithPodcastById(id: string | null) {
  if (!id) {
    return null
  }

  const res = await episodeWithPodcastByIdDbQuery(id)

  if (res.length !== 1) {
    return null
  }

  return res[0]
}

export function useGetLiveLocalEpisodeQuery({ id }: { id: string | null }) {
  return useLiveQuery(episodeWithPodcastByIdDbQuery(id), [id])
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
          title: podcastsTable.title,
        },
      })
      .from(episodesTable)
      .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
      .orderBy(desc(episodesTable.publishedAt)),
  )
}
