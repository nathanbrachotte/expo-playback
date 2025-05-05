import { useNavigation } from "@react-navigation/native"
import React from "react"
import { FlatList, ListRenderItem } from "react-native"
import { z } from "zod"

import { EpisodeCard } from "./EpisodeCard"
import { PureYStack } from "./PureStack"
import { SharedEpisodeFields } from "../types/db.types"
import { PLAYER_HEIGHT } from "./Player/Player"
import { getImageFromEntity } from "../utils/image.utils"

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const month = date.toLocaleString("default", { month: "short" })
  const day = date.getDate()
  const year = date.getFullYear()

  return `${month} ${day}, ${year}`
}

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
  const navigation = useNavigation()

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
