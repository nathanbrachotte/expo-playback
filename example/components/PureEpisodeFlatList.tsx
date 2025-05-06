import React, { ComponentProps } from "react"
import { FlatList, ListRenderItem } from "react-native"
import { z } from "zod"

import { PLAYER_HEIGHT } from "./Player/Player"
import { PureYStack } from "./PureStack"
import { SharedEpisodeFields } from "../types/db.types"

// should i be proud or ashamed?
export const uniqueKeySchema = z
  .object({
    id: z.number().optional(),
    appleId: z.union([z.string(), z.number()]).optional(),
    publishedAt: z.date().optional(),
  })
  .transform((episode) => ({
    uniqueKey:
      episode.publishedAt?.toISOString() || episode.appleId?.toString() || episode.id?.toString() || "BIG BIG TROUBLE",
  }))

export function EpisodesList({
  episodes,
  podcastTitle,
  renderItem,
  ListHeaderComponent,
  ListFooterComponent,
  keyExtractor,
}: {
  episodes: SharedEpisodeFields[]
  podcastTitle: string
  renderItem: ListRenderItem<SharedEpisodeFields>
  ListHeaderComponent?: ComponentProps<typeof FlatList>["ListHeaderComponent"]
  ListFooterComponent?: ComponentProps<typeof FlatList>["ListFooterComponent"]
  keyExtractor?: ComponentProps<typeof FlatList>["keyExtractor"]
}) {
  return (
    <FlatList
      data={episodes}
      keyExtractor={
        keyExtractor ??
        ((item) => {
          const uniqueKey = uniqueKeySchema.parse(item).uniqueKey
          console.log("🚀 ~ keyExtractor ~ uniqueKey:", uniqueKey)
          return uniqueKey
        })
      }
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        ListFooterComponent || (
          // !FIXME: Why is this needed?
          <PureYStack height={PLAYER_HEIGHT * 2} />
        )
      }
      showsVerticalScrollIndicator={false}
    />
  )
}
