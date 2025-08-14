import { useNavigation } from "@react-navigation/native"
import { Minus, RefreshCw } from "@tamagui/lucide-icons"
import React, { useMemo } from "react"
import { FlashList } from "@shopify/flash-list"
import { Paragraph, Spinner, Button } from "tamagui"

import { AboutSection } from "./PodcastScreen.shared"
import { useRemovePodcastMutation } from "../../clients/local.mutations"
import {
  useGetLocalEpisodesByPodcastIdQuery,
  useGetLocalPodcastQuery,
} from "../../clients/local.queries"
import { useFetchNewEpisodesFromOnePodcastMutation } from "../../clients/rss.queries"
import { PLayout } from "../../components/Layout"
import { PureXStack, PureYStack } from "../../components/PureStack"
import { LoadingScreen } from "../../components/Sections/Loading"
import { getPrettyMetadata } from "../../utils/metadata.utils"
import { EpisodeCard } from "../../components/EpisodeCard"

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

  const flashListData = useMemo(() => {
    if (!localEpisodes || !localPodcast) {
      return []
    }

    return localEpisodes.map((episode) => ({ ...episode, podcastId: localPodcast.appleId }))
  }, [localEpisodes, localPodcast])

  const renderItem = useMemo(() => {
    return ({ item }: { item: (typeof flashListData)[0] }) => {
      const episode = item.episode

      const prettyMetadata = item.episodeMetadata ? getPrettyMetadata(item.episodeMetadata) : null

      if (!localPodcast) {
        return null
      }

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
          imageProps={{
            lazy: true,
            priority: "low",
          }}
        />
      )
    }
  }, [localPodcast, navigation])

  if (isLocalEpisodesLoading || isLocalPodcastLoading || !localEpisodes || !localPodcast) {
    return (
      <PureYStack centered flex={1}>
        <Spinner />
      </PureYStack>
    )
  }

  return (
    <FlashList
      data={flashListData}
      renderItem={renderItem}
      estimatedItemSize={150} // Estimated height of EpisodeCard
      contentContainerStyle={{
        paddingHorizontal: 14,
      }}
      showsVerticalScrollIndicator
      removeClippedSubviews
      drawDistance={100}
      keyExtractor={(item) => `episode-${item.episode.id}`}
    />
  )
}
