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

export function useGetLocalPodcastQuery(id: string | null) {
  return useQuery({
    queryKey: ["savedPodcast", id],
    queryFn: async () => {
      if (!id) {
        return null
      }

      const podcasts = await db
        // TODO: use get()? There's gotta be a way to get only one episode
        .select()
        .from(schema.podcastsTable)
        .where(sql`id = ${id}`)
      return podcasts[0]
    },
    enabled: !!id,
  })
}

// !FIXME: Return only one episode from SQL query
// !FIXME: Types are so fucking fucked I hate this shit
//!FIXME THAT LOCAL QUERY DOEST WORK
export function useGetLiveLocalEpisodeQuery({ id }: { id: string | null }) {
  console.log("🚀 ~ useGetLiveLocalEpisodeQuery ~ id:", id)
  return useLiveQuery(
    db
      .select({
        episode: {
          ...episodesTable,
        },
        podcast: {
          id: podcastsTable.id,
          appleId: podcastsTable.appleId,
        },
      })
      .from(episodesTable)
      .where(sql`id = ${id}`)
      .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`),
  )
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
