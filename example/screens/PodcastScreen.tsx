import { useNavigation, useRoute } from "@react-navigation/native"
import { Minus, Plus } from "@tamagui/lucide-icons"
import React from "react"
import { FlatList } from "react-native"
import { Paragraph, Spinner, Button, CardProps, H5 } from "tamagui"

import { useGetItunesPodcastAndEpisodesQuery } from "../clients/itunes.queries"
import { useRemovePodcastMutation, useSavePodcastMutation } from "../clients/local.mutations"
import { useGetLocalEpisodesByPodcastIdQuery, useGetLocalPodcastQuery } from "../clients/local.queries"
import { CoverImage } from "../components/CoverImage"
import { EpisodeCard } from "../components/EpisodeCard"
import { PureLayout } from "../components/Layout"
import { PureXStack, PureYStack } from "../components/PureStack"
import { ErrorSection } from "../components/Sections/Error"
import { LoadingSection } from "../components/Sections/LoadingSection"
import { SharedPodcastFields } from "../types/db.types"
import { PodcastScreenRouteProp } from "../types/navigation.types"
import { DEVICE_WIDTH } from "../utils/constants"
import { getImageFromEntity } from "../utils/image.utils"
import { formatDate, formatDuration } from "../utils/time.utils"
import { getEpisodeStateFromMetadata } from "../utils/metadata"

function AboutSection({
  podcast,
  episodeCount,
  ActionSection,
}: {
  podcast: SharedPodcastFields
  episodeCount: number
  ActionSection: React.ReactNode
}) {
  return (
    <>
      <PureXStack px="$3" gap="$3">
        <CoverImage entity={podcast} size={DEVICE_WIDTH * 0.3} />
        <PureYStack flex={1} gap="$2">
          <PureYStack flex={1} jc="flex-start" ai="flex-start">
            <H5 numberOfLines={2}>{podcast.title}</H5>
            <Paragraph size="$4">Author(s): {podcast.author}</Paragraph>
            <Paragraph size="$4">Episodes: {episodeCount}</Paragraph>
          </PureYStack>
        </PureYStack>
      </PureXStack>
      <PureXStack px="$3" mt="$4">
        {ActionSection}
      </PureXStack>
    </>
  )
}

function EpisodeCardItem({
  title,
  image,
  podcastTitle,
  onPress,
  rssId,
  podcastId,
  publishedAt,
  duration,
  cardProps,
  ...prettyMetadata
}: {
  title: string
  image: string | null
  podcastTitle: string
  onPress?: VoidFunction
  rssId: string | null
  podcastId: number
  publishedAt: Date
  duration: number | null
  cardProps?: CardProps
  isFinished?: boolean
  isDownloaded?: boolean
  isDownloading?: boolean
  progress?: number
  isInProgress?: boolean
}) {
  const publishedAtString = formatDate(publishedAt)
  const durationString = duration ? formatDuration(duration) : null

  const extraInfo = `${publishedAtString} ${durationString ? `• ${durationString}` : ""}`

  return (
    <EpisodeCard
      bigHeader={title}
      smallHeader={podcastTitle}
      image={image}
      extraInfo={extraInfo}
      onPress={onPress}
      cardProps={cardProps}
      {...prettyMetadata}
    />
  )
}

export function PodcastScreen() {
  const route = useRoute<PodcastScreenRouteProp>()

  const { id } = route.params

  const { data: localPodcast, isLoading: isLocalLoading } = useGetLocalPodcastQuery(id ?? null)

  if (isLocalLoading) {
    return <LoadingSection />
  }

  if (!id) {
    return <ErrorSection />
  }

  if (localPodcast && !isLocalLoading) {
    return <LocalPodcastScreen id={id} />
  }

  return <RemotePodcastScreen id={id} />
}

export function LocalPodcastScreen({ id }: { id: string }) {
  const { data: localPodcast, isLoading: isLocalLoading } = useGetLocalPodcastQuery(id)
  const { data: localEpisodes, isLoading: isLocalEpisodesLoading } = useGetLocalEpisodesByPodcastIdQuery(id)

  const { mutateAsync: removePodcast, isPending: isRemoving } = useRemovePodcastMutation()

  if (isLocalLoading || !localPodcast || isLocalEpisodesLoading) {
    return <LoadingSection />
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
  const { data: localEpisodes, isLoading: isLocalEpisodesLoading } = useGetLocalEpisodesByPodcastIdQuery(id)

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
        const prettyMetadata = getEpisodeStateFromMetadata(item.episodeMetadata)

        return (
          <EpisodeCardItem
            title={episode.title}
            image={getImageFromEntity(episode, "100")}
            publishedAt={episode.publishedAt}
            duration={episode.duration}
            podcastTitle={localPodcast.title}
            rssId={episode.rssId}
            podcastId={episode.podcastId}
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

const LIMIT_ITUNES_INITIAL_FETCH = 15

export function RemotePodcastScreen({ id }: { id: string }) {
  const { data, isLoading } = useGetItunesPodcastAndEpisodesQuery(id ?? null, LIMIT_ITUNES_INITIAL_FETCH)
  console.log("🚀 ~ RemotePodcastScreen ~ data:", data)

  const { mutateAsync: savePodcast, isPending: isSaving } = useSavePodcastMutation({
    podcastId: id,
  })

  const podcast = data?.podcast
  const episodes = data?.episodes

  // const trackCount = usePodcastTrackCount(podcast)

  const isUpdatingLocal = isSaving || isSaving

  if (isLoading || !podcast || !episodes) {
    return <LoadingSection />
  }

  return (
    <PureLayout>
      {/* About Section */}
      <AboutSection
        podcast={podcast}
        episodeCount={podcast.extraInfo.episodeCount}
        ActionSection={
          <Button size="$2.5" icon={isUpdatingLocal ? null : Plus} onPress={() => savePodcast({ podcast })}>
            {isUpdatingLocal ? <Spinner /> : <Paragraph size="$3">Add to Library</Paragraph>}
          </Button>
        }
      />
      {/* Episodes Section */}
      <PureYStack flex={1} pt="$3">
        <RemoteEpisodesSection id={id} />
      </PureYStack>
    </PureLayout>
  )
}

export function RemoteEpisodesSection({ id }: { id: string }) {
  const { data, isLoading } = useGetItunesPodcastAndEpisodesQuery(id, LIMIT_ITUNES_INITIAL_FETCH)
  console.log("🚀 ~ RemoteEpisodesSection ~ data:", data)
  const podcast = data?.podcast
  const episodes = data?.episodes

  if (isLoading || !podcast || !episodes) {
    return (
      <PureYStack centered flex={1}>
        <Spinner />
      </PureYStack>
    )
  }

  const episodesWithPodcastId = episodes.map((episode) => ({ ...episode, podcastId: podcast.appleId }))

  return (
    <FlatList
      contentContainerStyle={{
        paddingHorizontal: 14,
      }}
      data={episodesWithPodcastId}
      renderItem={({ item }) => {
        return (
          <EpisodeCardItem
            title={item.title}
            image={getImageFromEntity(item, "100")}
            publishedAt={item.publishedAt}
            duration={item.duration}
            podcastTitle={podcast.title}
            rssId={item.rssId}
            podcastId={item.podcastId}
            cardProps={{
              opacity: 0.5,
              hoverStyle: { scale: 1 },
              pressStyle: { scale: 1 },
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
