import { useQuery } from "@tanstack/react-query"

import { db, schema } from "../db/client"

export function useSavedPodcasts() {
  return useQuery({
    queryKey: ["savedPodcasts"],
    queryFn: async () => {
      const podcasts = await db.select().from(schema.podcastsTable)
      return podcasts
    },
  })
}
