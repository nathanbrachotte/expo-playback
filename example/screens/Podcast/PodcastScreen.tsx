import { useNavigation, useRoute } from "@react-navigation/native"
import { Minus } from "@tamagui/lucide-icons"
import React from "react"
import { FlatList } from "react-native"
import { Paragraph, Spinner, Button } from "tamagui"

import { RemotePodcastScreen } from "./LocalComponents"
import { AboutSection, EpisodeCardItem } from "./shared"
import { useRemovePodcastMutation } from "../../clients/local.mutations"
import {
  useGetLocalEpisodesByPodcastIdQuery,
  useGetLocalPodcastQuery,
} from "../../clients/local.queries"
import { PureLayout } from "../../components/Layout"
import { PureYStack } from "../../components/PureStack"
import { ErrorScreen } from "../../components/Sections/Error"
import { LoadingScreen } from "../../components/Sections/Loading"
import { PodcastScreenRouteProp } from "../../types/navigation.types"
import { getImageFromEntity } from "../../utils/image.utils"
import { getEpisodeStateFromMetadata } from "../../utils/metadata"

export function PodcastScreen() {
  const route = useRoute<PodcastScreenRouteProp>()

  const { id } = route.params

  const { data: localPodcast, isLoading: isLocalLoading } = useGetLocalPodcastQuery(id ?? null)

  if (isLocalLoading) {
    return <LoadingScreen />
  }

  if (!id) {
    return <ErrorScreen />
  }

  if (localPodcast && !isLocalLoading) {
    return <LocalPodcastScreen id={id} />
  }

  return <RemotePodcastScreen id={id} />
}

export function LocalPodcastScreen({ id }: { id: string }) {
  const { data: localPodcast, isLoading: isLocalLoading } = useGetLocalPodcastQuery(id)
  const { data: localEpisodes, isLoading: isLocalEpisodesLoading } =
    useGetLocalEpisodesByPodcastIdQuery(id)

  const { mutateAsync: removePodcast, isPending: isRemoving } = useRemovePodcastMutation()

  if (isLocalLoading || !localPodcast || isLocalEpisodesLoading) {
    return <LoadingScreen />
  }

  return (
    <PureLayout>
      {/* About Section */}
      <AboutSection
        podcast={localPodcast}
        episodeCount={localEpisodes?.length || 0}
        ActionSection={
          <Button
            size="$2.5"
            onPress={() => removePodcast(String(localPodcast.appleId))}
            icon={isRemoving ? null : Minus}
          >
            {isRemoving ? <Spinner /> : <Paragraph size="$3">Remove from Library</Paragraph>}
          </Button>
        }
      />
      {/* Episodes Section */}
      <PureYStack flex={1} pt="$3">
        <LocalEpisodesSection id={id} />
      </PureYStack>
    </PureLayout>
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
      contentContainerStyle={{
        paddingHorizontal: 14,
      }}
      data={localEpisodes.map((episode) => ({ ...episode, podcastId: localPodcast.appleId }))}
      renderItem={({ item }) => {
        const episode = item.episode

        const prettyMetadata = item.episodeMetadata
          ? getEpisodeStateFromMetadata(item.episodeMetadata)
          : null

        return (
          <EpisodeCardItem
            title={episode.title}
            image={getImageFromEntity(episode, "100") || getImageFromEntity(localPodcast, "100")}
            publishedAt={episode.publishedAt}
            duration={episode.duration}
            podcastTitle={localPodcast.title}
            rssId={episode.rssId}
            podcastId={episode.podcastId}
            episodeId={episode.id}
            onPress={() => {
              navigation.navigate("Episode", {
                episodeId: String(episode.id),
                podcastId: String(episode.podcastId),
              })
            }}
            {...prettyMetadata}
          />
        )
      }}
    />
  )
}
