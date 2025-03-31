import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sql } from "drizzle-orm"
import { SearchResult } from "../types/podcast"
import { db, schema } from "../db/client"

export function useSavePodcast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (podcast: SearchResult) => {
      const result = await db.insert(schema.podcasts).values({
        title: podcast.title,
        description: podcast.description,
        image: podcast.artworkUrl100,
        createdAt: new Date(),
        updatedAt: new Date(),
      } satisfies typeof schema.podcasts.$inferInsert)

      return result
    },
    onSuccess: () => {
      // Invalidate and refetch saved podcasts query
      queryClient.invalidateQueries({ queryKey: ["savedPodcasts"] })
    },
  })
}

export function useRemovePodcast() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (podcastId: number) => {
      const result = await db.delete(schema.podcasts).where(sql`id = ${podcastId}`)
      return result
    },
    onSuccess: () => {
      // Invalidate and refetch saved podcasts query
      queryClient.invalidateQueries({ queryKey: ["savedPodcasts"] })
    },
  })
}
