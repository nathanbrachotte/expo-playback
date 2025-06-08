import { useNavigation } from "@react-navigation/native"
import React from "react"
import { FlatList } from "react-native"
import { H3, Paragraph, YStack } from "tamagui"

import { useAllDownloadedEpisodesQuery } from "../clients/local.queries"
import { PLayout } from "../components/Layout"
import { ErrorSection } from "../components/Sections/Error"
import { LoadingSection } from "../components/Sections/Loading"
import { getEpisodeStateFromMetadata } from "../utils/metadata.utils"
import { SECTION_PADDING_VALUE } from "../components/Sections/PureSection"
import { NewEpisodeCard } from "../components/episode"

export function EpisodesFlatlist() {
  const navigation = useNavigation()
  const {
    data: episodesWithPodcastsAndMetadata,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAllDownloadedEpisodesQuery()

  if (error) {
    return <ErrorSection />
  }

  if (isLoading) {
    return <LoadingSection />
  }

  // Flatten the pages into a single array
  const allEpisodes = episodesWithPodcastsAndMetadata?.pages.flat() ?? []

  if (allEpisodes.length === 0) {
    return (
      <YStack flex={1} gap="$4">
        <Paragraph>No episodes found</Paragraph>
      </YStack>
    )
  }

  return (
    <FlatList
      data={allEpisodes}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      }}
      onEndReachedThreshold={0.3}
      contentContainerStyle={{ paddingHorizontal: SECTION_PADDING_VALUE / 2 }}
      renderItem={({ item }) => {
        const prettyMetadata = item.episodeMetadata
          ? getEpisodeStateFromMetadata(item.episodeMetadata, item.episode.duration)
          : null

        return (
          <NewEpisodeCard
            episode={item.episode}
            podcast={item.podcast}
            prettyMetadata={prettyMetadata}
            onCardPress={() => {
              navigation.navigate("Episode", {
                episodeId: String(item.episode.id),
                podcastId: String(item.podcast.id),
              })
            }}
          />
        )
      }}
    />
  )
}

export function LatestEpisodesScreen() {
  return (
    <PLayout.Screen header={<H3>Latest episodes</H3>}>
      <EpisodesFlatlist />
    </PLayout.Screen>
  )
}
