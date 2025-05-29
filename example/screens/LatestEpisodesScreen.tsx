import { useNavigation } from "@react-navigation/native"
import React from "react"
import { FlatList } from "react-native"
import { H3, Paragraph, YStack } from "tamagui"

import { useAllDownloadedEpisodesQuery } from "../clients/local.queries"
import { EpisodeCard } from "../components/EpisodeCard"
import { PureLayout } from "../components/Layout"
import { ErrorSection } from "../components/Sections/Error"
import { LoadingSection } from "../components/Sections/Loading"
import { getImageFromEntity } from "../utils/image.utils"
import { getEpisodeStateFromMetadata } from "../utils/metadata"
import { SECTION_PADDING_VALUE } from "../components/Sections/PureSection"
import { DurationAndDateSection, EpisodeDescription } from "../components/episode"

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
              <>
                <EpisodeDescription description={episode.description} />
                <DurationAndDateSection
                  duration={episode.duration}
                  date={episode.publishedAt}
                  isFinished={prettyMetadata?.isFinished}
                  progress={prettyMetadata?.progress}
                />
              </>
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
  )
}

export function LatestEpisodesScreen() {
  return (
    <PureLayout header={<H3>Latest episodes</H3>}>
      <EpisodesFlatlist />
    </PureLayout>
  )
}
