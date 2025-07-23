import { Plus } from "@tamagui/lucide-icons"
import React from "react"
import { FlatList } from "react-native"
import { Paragraph, Spinner, Button } from "tamagui"

import { AboutSection } from "./shared"
import { useGetItunesPodcastAndEpisodesQuery } from "../../clients/itunes.queries"
import { useSavePodcastMutation } from "../../clients/local.mutations"
import { PLayout } from "../../components/Layout"
import { PureYStack } from "../../components/PureStack"
import { LoadingScreen } from "../../components/Sections/Loading"
import { SECTION_PADDING_VALUE } from "../../components/Sections/PureSection"
import { EpisodeCard } from "../../components/EpisodeCard"

const LIMIT_ITUNES_INITIAL_FETCH = 15

export function RemotePodcastScreen({ id }: { id: string }) {
  const { data, isLoading } = useGetItunesPodcastAndEpisodesQuery(
    id ?? null,
    LIMIT_ITUNES_INITIAL_FETCH,
  )

  const { mutateAsync: savePodcast, isPending: isSaving } = useSavePodcastMutation({
    podcastId: id,
  })

  const podcast = data?.podcast
  const episodes = data?.episodes

  // const trackCount = usePodcastTrackCount(podcast)

  const isUpdatingLocal = isSaving || isSaving

  if (isLoading || !podcast || !episodes) {
    return <LoadingScreen />
  }

  return (
    <PLayout.Screen>
      {/* About Section */}
      <AboutSection
        podcast={podcast}
        episodeCount={podcast.extraInfo.episodeCount}
        ActionSection={
          <Button
            size="$2.5"
            icon={isUpdatingLocal ? null : Plus}
            onPress={() => savePodcast({ podcast })}
          >
            {isUpdatingLocal ? <Spinner /> : <Paragraph size="$3">Add to Library</Paragraph>}
          </Button>
        }
      />
      {/* Episodes Section */}
      <PureYStack flex={1} pt="$3">
        <RemoteEpisodesSection id={id} />
      </PureYStack>
    </PLayout.Screen>
  )
}

export function RemoteEpisodesSection({ id }: { id: string }) {
  const { data, isLoading } = useGetItunesPodcastAndEpisodesQuery(id, LIMIT_ITUNES_INITIAL_FETCH)

  const podcast = data?.podcast
  const episodes = data?.episodes

  if (isLoading || !podcast || !episodes) {
    return (
      <PureYStack centered flex={1}>
        <Spinner />
      </PureYStack>
    )
  }

  const episodesWithPodcastId = episodes.map((episode) => ({
    ...episode,
    podcastId: podcast.appleId,
  }))

  return (
    <FlatList
      indicatorStyle="white"
      contentContainerStyle={{
        paddingHorizontal: SECTION_PADDING_VALUE / 2,
      }}
      data={episodesWithPodcastId}
      renderItem={({ item }) => {
        return (
          <EpisodeCard
            cardProps={{
              opacity: 0.5,
              hoverStyle: { scale: 1 },
              pressStyle: { scale: 1 },
            }}
            episode={{
              title: item.title,
              description: item.description,
              duration: item.duration,
              publishedAt: item.publishedAt,
              image30: item.image30,
              image60: item.image60,
              image100: item.image100,
              image600: item.image600,
            }}
            podcast={{
              id: podcast.appleId,
              title: podcast.title,
              image30: podcast.image30,
              image60: podcast.image60,
              image600: podcast.image600,
              image100: podcast.image100,
            }}
          />
        )
      }}
      ListFooterComponent={
        <PureYStack h="$12" centered>
          <Paragraph>Add to Library to see all available episodes 😊</Paragraph>
        </PureYStack>
      }
    />
  )
}
