import { useNavigation } from "@react-navigation/native"
import React from "react"
import { FlatList } from "react-native"
import { H3, Paragraph, YStack } from "tamagui"

import { useAllInProgressEpisodesQuery } from "../clients/local.queries"
import { EpisodeCard } from "../components/EpisodeCard"
import { PLayout } from "../components/Layout"
import { ErrorScreen } from "../components/Sections/Error"
import { LoadingScreen } from "../components/Sections/Loading"
import { getImageFromEntity } from "../utils/image.utils"
import { getEpisodeStateFromMetadata } from "../utils/metadata"
import { SECTION_PADDING_VALUE } from "../components/Sections/PureSection"
import { DurationAndDateSection, CleanEpisodeDescription } from "../components/episode"
import { PureYStack } from "../components/PureStack"

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
      <PLayout.Screen header={<H3>In Progress Episodes</H3>}>
        <YStack flex={1} gap="$4" justifyContent="center" alignItems="center">
          <Paragraph>No episodes in progress</Paragraph>
        </YStack>
      </PLayout.Screen>
    )
  }

  return (
    <PLayout.Screen header={<H3>In Progress</H3>}>
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
          const episode = item.episode
          const podcast = item.podcast
          const prettyMetadata = item.episodeMetadata
            ? getEpisodeStateFromMetadata(item.episodeMetadata)
            : null

          return (
            <EpisodeCard
              smallHeader={podcast.title}
              bigHeader={episode.title}
              image={getImageFromEntity(episode, "100") || getImageFromEntity(podcast, "100")}
              extraInfo={
                <PureYStack gap="$1.5">
                  <CleanEpisodeDescription description={episode.description} />
                  <DurationAndDateSection
                    duration={episode.duration}
                    date={episode.publishedAt}
                    isFinished={prettyMetadata?.isFinished}
                    progress={prettyMetadata?.progress}
                  />
                </PureYStack>
              }
              onPress={() => {
                if (!episode.rssId) {
                  throw new Error("Found episode without an rssId")
                }

                navigation.navigate("Episode", {
                  episodeId: String(episode.id),
                  podcastId: String(podcast.id),
                })
              }}
              episodeId={episode.id}
              {...prettyMetadata}
            />
          )
        }}
      />
    </PLayout.Screen>
  )
}
