import React from "react"
import { FlatList, ListRenderItem } from "react-native"
import { z } from "zod"

import { PLAYER_HEIGHT } from "./Player/Player"
import { PureYStack } from "./PureStack"
import { SharedEpisodeFields } from "../types/db.types"

// should i be proud or ashamed?
const uniqueKeySchema = z
  .object({
    id: z.number().optional(),
    appleId: z.union([z.string(), z.number()]).optional(),
    publishedAt: z.date().optional(),
  })
  .transform((epi) => ({
    uniqueKey:
      epi.id?.toString() || epi.appleId?.toString() || epi.publishedAt?.getDate().toString() || "BIG BIG TROUBLE",
  }))

export function EpisodesList({
  episodes,
  podcastTitle,
  renderItem,
}: {
  episodes: SharedEpisodeFields[]
  podcastTitle: string
  renderItem: ListRenderItem<SharedEpisodeFields>
}) {
  return (
    <FlatList
      data={episodes}
      keyExtractor={(item) => uniqueKeySchema.parse(item).uniqueKey}
      renderItem={renderItem}
      // ListHeaderComponent={}
      ListFooterComponent={
        // !FIXME: Why is this needed?
        <PureYStack height={PLAYER_HEIGHT * 2} />
      }
      showsVerticalScrollIndicator={false}
    />
  )
}
