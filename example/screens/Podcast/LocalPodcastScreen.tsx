import { useNavigation } from "@react-navigation/native"
import { Minus } from "@tamagui/lucide-icons"
import React from "react"
import { FlatList } from "react-native"
import { Paragraph, Spinner, Button } from "tamagui"

import { AboutSection } from "./shared"
import { useRemovePodcastMutation } from "../../clients/local.mutations"
import {
  useGetLocalEpisodesByPodcastIdQuery,
  useGetLocalPodcastQuery,
} from "../../clients/local.queries"
import { PLayout } from "../../components/Layout"
import { PureYStack } from "../../components/PureStack"
import { LoadingScreen } from "../../components/Sections/Loading"
import { getImageFromEntity } from "../../utils/image.utils"
import { getEpisodeStateFromMetadata } from "../../utils/metadata"
import { EpisodeCard } from "../../components/EpisodeCard"
import { DurationAndDateSection, CleanEpisodeDescription } from "../../components/episode"

export function LocalPodcastScreen({ id }: { id: string }) {
  const { data: localPodcast, isLoading: isLocalLoading } = useGetLocalPodcastQuery(id)
  const { data: localEpisodes, isLoading: isLocalEpisodesLoading } =
    useGetLocalEpisodesByPodcastIdQuery(id)

  const { mutateAsync: removePodcast, isPending: isRemoving } = useRemovePodcastMutation()

  if (isLocalLoading || !localPodcast || isLocalEpisodesLoading) {
    return <LoadingScreen />
  }

  return (
    <PLayout.Screen>
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
          <EpisodeCard
            bigHeader={episode.title}
            smallHeader={localPodcast.title}
            image={getImageFromEntity(episode, "100") || getImageFromEntity(localPodcast, "100")}
            extraInfo={
              <>
                <CleanEpisodeDescription description={episode.description} />
                <DurationAndDateSection
                  duration={episode.duration}
                  date={episode.publishedAt}
                  progress={prettyMetadata?.progress}
                />
              </>
            }
            onPress={() => {
              navigation.navigate("Episode", {
                episodeId: String(episode.id),
                podcastId: String(episode.podcastId),
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
