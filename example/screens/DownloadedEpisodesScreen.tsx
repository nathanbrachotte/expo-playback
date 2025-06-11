import { useNavigation } from "@react-navigation/native"
import React from "react"
import { FlatList } from "react-native"
import { H3, Paragraph, YStack } from "tamagui"

import { useAllDownloadedEpisodesQuery } from "../clients/local.queries"
import { PLayout } from "../components/Layout"
import { ErrorScreen } from "../components/Sections/Error"
import { LoadingScreen } from "../components/Sections/Loading"
import { getEpisodeStateFromMetadata } from "../utils/metadata.utils"
import { SECTION_PADDING_VALUE } from "../components/Sections/PureSection"
import { NewEpisodeCard } from "../components/episode"

export function Header() {
  return <H3>Downloaded</H3>
}

export function DownloadedEpisodesScreen() {
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
    return <ErrorScreen header={<Header />} />
  }

  if (isLoading) {
    return <LoadingScreen header={<Header />} />
  }

  // Flatten the pages into a single array
  const allEpisodes = episodesWithPodcastsAndMetadata?.pages.flat() ?? []

  if (allEpisodes.length === 0) {
    return (
      <PLayout.Screen header={<Header />}>
        <YStack flex={1} gap="$4" justifyContent="center" alignItems="center">
          <Paragraph>No downloaded episodes yet</Paragraph>
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
            ? getEpisodeStateFromMetadata(item.episodeMetadata, episode.duration)
            : null
          // if (episode.id === 516) {
          //   console.log(
          //     "🚀 ~ DownloadedEpisodesScreen ~ episode:",
          //     JSON.stringify(episode, null, 2),
          //   )
          //   console.log(
          //     "🚀 ~ DownloadedEpisodesScreen ~ metadata:",
          //     JSON.stringify(item.episodeMetadata, null, 2),
          //   )
          //   console.log(
          //     "🚀 ~ DownloadedEpisodesScreen ~ prettyMetadata:",
          //     JSON.stringify(prettyMetadata, null, 2),
          //   )
          // }
          return (
            <NewEpisodeCard
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
