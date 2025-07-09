import { useNavigation } from "@react-navigation/native"
import React from "react"
import { FlatList } from "react-native"
import { H3, Paragraph, YStack } from "tamagui"

import { useAllInProgressEpisodesQuery } from "../clients/local.queries"
import { PLayout } from "../components/Layout"
import { ErrorScreen } from "../components/Sections/Error"
import { LoadingScreen } from "../components/Sections/Loading"
import { getEpisodeStateFromMetadata } from "../utils/metadata.utils"
import { SECTION_PADDING_VALUE } from "../components/Sections/PureSection"
import { EpisodeCard } from "../components/episode"

export function Header() {
  return <H3>In Progress</H3>
}

export function InProgressEpisodesScreen() {
  const navigation = useNavigation()
  const {
    data: episodesWithPodcastsAndMetadata,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAllInProgressEpisodesQuery()

  if (error) {
    return <ErrorScreen />
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  // Flatten the pages into a single array
  const allEpisodes = episodesWithPodcastsAndMetadata?.pages.flat() ?? []

  if (allEpisodes.length === 0) {
    return (
      <PLayout.Screen header={<Header />}>
        <YStack flex={1} gap="$4" justifyContent="center" alignItems="center">
          <Paragraph>No episodes in progress</Paragraph>
        </YStack>
      </PLayout.Screen>
    )
  }

  return (
    <PLayout.Screen header={<Header />}>
      <FlatList
        indicatorStyle="white"
        data={allEpisodes}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        }}
        onEndReachedThreshold={0.3}
        contentContainerStyle={{ paddingHorizontal: SECTION_PADDING_VALUE / 2 }}
        renderItem={({ item }) => {
          const episode = item.episode
          const podcast = item.podcast
          const prettyMetadata = item.episodeMetadata
            ? getEpisodeStateFromMetadata(item.episodeMetadata)
            : null

          return (
            <EpisodeCard
              episode={episode}
              podcast={podcast}
              prettyMetadata={prettyMetadata}
              onCardPress={() => {
                navigation.navigate("Episode", {
                  episodeId: String(episode.id),
                  podcastId: String(podcast.id),
                })
              }}
            />
          )
        }}
      />
    </PLayout.Screen>
  )
}
