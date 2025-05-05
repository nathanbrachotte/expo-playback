import { useNavigation } from "@react-navigation/native"
import React from "react"
import { YStack, Paragraph } from "tamagui"

import { EpisodeCard } from "./EpisodeCard"
import { EpisodesList } from "./PureEpisodeFlatList"
import { useAllEpisodesQuery } from "../clients/local.queries"
import { getImageFromEntity } from "../utils/image.utils"

// TODO: Fix this shit
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// TODO: Fix this shit
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const month = date.toLocaleString("default", { month: "short" })
  const day = date.getDate()
  const year = date.getFullYear()

  return `${month} ${day}, ${year}`
}

export function AllEpisodesList() {
  const navigation = useNavigation()
  const { data: episodesWithPodcasts } = useAllEpisodesQuery()

  const isLoading = !episodesWithPodcasts

  if (isLoading) {
    return <Paragraph>Loading episodes...</Paragraph>
  }

  if (!episodesWithPodcasts || episodesWithPodcasts.length === 0) {
    return (
      <YStack flex={1} gap="$4">
        <Paragraph>No episodes found</Paragraph>
      </YStack>
    )
  }

  return (
    <EpisodesList
      podcastTitle={episodesWithPodcasts[0].podcast.title}
      episodes={episodesWithPodcasts.map((episode) => episode.episode) ?? []}
      renderItem={({ item }) => {
        // TODO: Use date-fns to render this correctly
        const publishedAt = formatDate(Number(item.publishedAt))
        const duration = formatDuration(item.duration)

        return (
          <EpisodeCard
            title={item.title}
            subtitle={item.description}
            image={getImageFromEntity(item, "100")}
            extraInfo={`${publishedAt} • ${duration}`}
            //! FIXME: THIS WILL NEVER WORK. DUH.
            podcastTitle={episodesWithPodcasts[0].podcast.title}
            onPress={() => {
              if (!item.rssId) {
                throw new Error("Found episode without an rssId")
              }

              navigation.navigate("Episode", { episodeId: item.rssId, podcastId: String(item.podcastId) })
            }}
          />
        )
      }}
    />
  )
}
