import { useNavigation } from "@react-navigation/native"
import React from "react"
import { FlatList } from "react-native"
import { Paragraph, YStack } from "tamagui"

import { EpisodeCard } from "./EpisodeCard"
import { useAllEpisodesQuery } from "../clients/local.queries"
import { getDurationAndDateFromEpisode } from "../utils/episodes.utils"
import { getImageFromEntity } from "../utils/image.utils"

export function EpisodesFlatlist() {
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
    <FlatList
      data={episodesWithPodcasts.map((episode) => episode.episode) ?? []}
      renderItem={({ item }) => {
        return (
          <EpisodeCard
            title={item.title}
            subtitle={item.description}
            image={getImageFromEntity(item, "100") || getImageFromEntity(episodesWithPodcasts[0].podcast, "100")}
            extraInfo={getDurationAndDateFromEpisode(item).label}
            //! FIXME: THIS WILL NEVER WORK. DUH.
            podcastTitle={episodesWithPodcasts[0].podcast.title}
            onPress={() => {
              if (!item.rssId) {
                throw new Error("Found episode without an rssId")
              }

              navigation.navigate("Episode", { episodeId: String(item.id), podcastId: String(item.podcastId) })
            }}
          />
        )
      }}
    />
  )
}
