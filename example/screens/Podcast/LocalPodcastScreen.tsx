import { useNavigation } from "@react-navigation/native"
import { Minus, RefreshCw } from "@tamagui/lucide-icons"
import React from "react"
import { FlatList } from "react-native"
import { Paragraph, Spinner, Button } from "tamagui"

import { AboutSection } from "./shared"
import { useRemovePodcastMutation } from "../../clients/local.mutations"
import {
  useGetLocalEpisodesByPodcastIdQuery,
  useGetLocalPodcastQuery,
} from "../../clients/local.queries"
import { useFetchNewEpisodesFromOnePodcastMutation } from "../../clients/rss.queries"
import { PLayout } from "../../components/Layout"
import { PureXStack, PureYStack } from "../../components/PureStack"
import { LoadingScreen } from "../../components/Sections/Loading"
import { getEpisodeStateFromMetadata } from "../../utils/metadata.utils"
import { EpisodeCard } from "../../components/episode"

export function LocalPodcastScreen({ id }: { id: string }) {
  const { data: localPodcast, isLoading: isLocalLoading } = useGetLocalPodcastQuery(id)
  const { data: localEpisodes, isLoading: isLocalEpisodesLoading } =
    useGetLocalEpisodesByPodcastIdQuery(id)

  const { mutateAsync: removePodcast, isPending: isRemoving } = useRemovePodcastMutation()
  const { mutateAsync: fetchNewEpisodes, isPending: isFetching } =
    useFetchNewEpisodesFromOnePodcastMutation()

  if (isLocalLoading || !localPodcast || isLocalEpisodesLoading) {
    return <LoadingScreen />
  }

  const handleFetchNewEpisodes = () => {
    fetchNewEpisodes(localPodcast.id)
  }

  return (
    <PLayout.Screen>
      {/* About Section */}
      <AboutSection
        podcast={localPodcast}
        episodeCount={localEpisodes?.length || 0}
        ActionSection={
          <PureXStack gap="$2">
            <Button
              size="$2.5"
              onPress={handleFetchNewEpisodes}
              icon={isFetching ? null : RefreshCw}
              disabled={isFetching}
            >
              {isFetching ? <Spinner size="small" /> : <Paragraph size="$3">Refresh</Paragraph>}
            </Button>
            <Button
              size="$2.5"
              onPress={() => removePodcast(String(localPodcast.appleId))}
              icon={isRemoving ? null : Minus}
            >
              {isRemoving ? <Spinner /> : <Paragraph size="$3">Remove from Library</Paragraph>}
            </Button>
          </PureXStack>
        }
      />
      {/* Episodes Section */}
      <PureYStack flex={1} pt="$3">
        <LocalEpisodesSection id={id} />
      </PureYStack>
    </PLayout.Screen>
  )
}

export function LocalEpisodesSection({ id }: { id: string }) {
  const navigation = useNavigation()
  const { data: localPodcast, isLoading: isLocalPodcastLoading } = useGetLocalPodcastQuery(id)
  const { data: localEpisodes, isLoading: isLocalEpisodesLoading } =
    useGetLocalEpisodesByPodcastIdQuery(id)

  if (isLocalEpisodesLoading || isLocalPodcastLoading || !localEpisodes || !localPodcast) {
    return (
      <PureYStack centered flex={1}>
        <Spinner />
      </PureYStack>
    )
  }

  return (
    <FlatList
      indicatorStyle="white"
      contentContainerStyle={{
        paddingHorizontal: 14,
      }}
      data={localEpisodes.map((episode) => ({ ...episode, podcastId: localPodcast.appleId }))}
      renderItem={({ item }) => {
        const episode = item.episode

        const prettyMetadata = getEpisodeStateFromMetadata(item.episodeMetadata)

        return (
          <EpisodeCard
            episode={episode}
            podcast={localPodcast}
            initialPrettyMetadata={prettyMetadata}
            onCardPress={() => {
              navigation.navigate("Episode", {
                episodeId: String(episode.id),
                podcastId: String(episode.podcastId),
              })
            }}
          />
        )
      }}
    />
  )
}
