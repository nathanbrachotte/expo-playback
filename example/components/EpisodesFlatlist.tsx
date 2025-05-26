import { useNavigation } from "@react-navigation/native"
import React from "react"
import { FlatList } from "react-native"
import { Paragraph, YStack } from "tamagui"

import { EpisodeCard } from "./EpisodeCard"
import { useAllDownloadedEpisodesQuery, useAllEpisodesQuery } from "../clients/local.queries"
import { getDurationAndDateFromEpisode } from "../utils/episodes.utils"
import { getImageFromEntity } from "../utils/image.utils"
import { getEpisodeStateFromMetadata } from "../utils/metadata"

export function EpisodesFlatlist() {
  const navigation = useNavigation()
  const { data: episodesWithPodcastsAndMetadata } = useAllDownloadedEpisodesQuery()

  const isLoading = !episodesWithPodcastsAndMetadata

  if (isLoading) {
    return <Paragraph>Loading episodes...</Paragraph>
  }

  if (!episodesWithPodcastsAndMetadata || episodesWithPodcastsAndMetadata.length === 0) {
    return (
      <YStack flex={1} gap="$4">
        <Paragraph>No episodes found</Paragraph>
      </YStack>
    )
  }

  return (
    <FlatList
      data={episodesWithPodcastsAndMetadata}
      renderItem={({ item }) => {
        const episode = item.episode
        const podcast = item.podcast
        const prettyMetadata = getEpisodeStateFromMetadata(item.episodeMetadata)

        return (
          <EpisodeCard
            title={episode.title}
            subtitle={episode.description}
            image={getImageFromEntity(episode, "100") || getImageFromEntity(podcast, "100")}
            extraInfo={getDurationAndDateFromEpisode(episode).label}
            podcastTitle={podcast.title}
            onPress={() => {
              if (!episode.rssId) {
                throw new Error("Found episode without an rssId")
              }

              navigation.navigate("Episode", { episodeId: String(episode.id), podcastId: String(podcast.id) })
            }}
            {...prettyMetadata}
          />
        )
      }}
    />
  )
}
