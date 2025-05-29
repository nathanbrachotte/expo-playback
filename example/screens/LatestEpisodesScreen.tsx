import { useNavigation } from "@react-navigation/native"
import React from "react"
import { FlatList } from "react-native"
import { H3, Paragraph, YStack } from "tamagui"

import { useAllDownloadedEpisodesQuery } from "../clients/local.queries"
import { EpisodeCard } from "../components/EpisodeCard"
import { PureLayout } from "../components/Layout"
import { ErrorSection } from "../components/Sections/Error"
import { LoadingSection } from "../components/Sections/Loading"
import { PureSection } from "../components/Sections/PureSection"
import { getDurationAndDateFromEpisode } from "../utils/episodes.utils"
import { getImageFromEntity } from "../utils/image.utils"
import { getEpisodeStateFromMetadata } from "../utils/metadata"

export function EpisodesFlatlist() {
  const navigation = useNavigation()
  const { data: episodesWithPodcastsAndMetadata, error, isLoading } = useAllDownloadedEpisodesQuery()

  if (error) {
    return <ErrorSection />
  }

  if (isLoading) {
    return <LoadingSection />
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
        const prettyMetadata = item.episodeMetadata ? getEpisodeStateFromMetadata(item.episodeMetadata) : null

        return (
          <EpisodeCard
            smallHeader={podcast.title}
            bigHeader={episode.title}
            subtitle={episode.description}
            image={getImageFromEntity(episode, "100") || getImageFromEntity(podcast, "100")}
            extraInfo={getDurationAndDateFromEpisode(episode).label}
            onPress={() => {
              if (!episode.rssId) {
                throw new Error("Found episode without an rssId")
              }

              navigation.navigate("Episode", { episodeId: String(episode.id), podcastId: String(podcast.id) })
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
      <PureSection.Wrapper flex={1}>
        <EpisodesFlatlist />
      </PureSection.Wrapper>
    </PureLayout>
  )
}
