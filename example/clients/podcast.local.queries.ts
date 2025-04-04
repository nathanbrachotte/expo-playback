import { useQuery } from "@tanstack/react-query"
import { desc, sql } from "drizzle-orm"
import { useLiveQuery } from "drizzle-orm/expo-sqlite"

import { db, schema } from "../db/client"
import { episodesTable, podcastsTable } from "../db/schema"

export function useSavedPodcastsQuery() {
  return useQuery({
    queryKey: ["savedPodcasts"],
    queryFn: async () => {
      const podcasts = await db.select().from(schema.podcastsTable)
      return podcasts
    },
  })
}

// Join episodes with podcasts to get podcast title, and order by published_at desc
export const useAllEpisodesQuery = (podcastId: number) => {
  return useLiveQuery(
    db
      .select({
        episode: {
          id: episodesTable.id,
          title: episodesTable.title,
          description: episodesTable.description,
          image: episodesTable.image,
          publishedAt: episodesTable.publishedAt,
          duration: episodesTable.duration,
          downloadUrl: episodesTable.downloadUrl,
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
