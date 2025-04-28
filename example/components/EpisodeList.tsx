import { useNavigation } from "@react-navigation/native"
import React from "react"
import { FlatList } from "react-native"

import { EpisodeCard } from "./EpisodeCard"
import { SharedEpisodeFields } from "../types/db.types"
import { Optional } from "../utils/types.utils"
import { z } from "zod"
import { PureYStack } from "./PureStack"
import { Paragraph } from "tamagui"

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

export function EpisodesList({ episodes, podcastTitle }: { episodes: SharedEpisodeFields[]; podcastTitle: string }) {
  const navigation = useNavigation()

  return (
    <FlatList
      data={episodes}
      keyExtractor={(item) => uniqueKeySchema.parse(item).uniqueKey}
      renderItem={({ item }) => {
        // TODO: Use date-fns to render this correctly
        const publishedAt = formatDate(Number(item.publishedAt))
        const duration = formatDuration(item.duration)

        return (
          <EpisodeCard
            title={item.title}
            subtitle={item.description}
            image={item.image}
            extraInfo={`${publishedAt} • ${duration}`}
            podcastTitle={podcastTitle}
            onPress={() => {
              if (!item.appleId) {
                throw new Error("Found episode without an appleId")
              }

              navigation.navigate("Episode", { episodeId: item.appleId, podcastId: String(item.podcastId) })
            }}
          />
        )
      }}
      // ListHeaderComponent={}
      ListFooterComponent={
        // !FIXME: Why is this needed?
        <PureYStack height="$19" />
      }
      showsVerticalScrollIndicator={false}
    />
  )
}
