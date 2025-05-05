import { useNavigation, useRoute } from "@react-navigation/native"
import { Minus, Plus } from "@tamagui/lucide-icons"
import { H4, Paragraph, Spinner, Button } from "tamagui"

import { useGetItunesPodcastAndEpisodesQuery } from "../clients/itunes.queries"
import { useRemovePodcastMutation, useSavePodcastMutation } from "../clients/local.mutations"
import { useGetLocalEpisodesByPodcastIdQuery, useGetLocalPodcastQuery } from "../clients/local.queries"
import { useGetRssEpisodesQuery } from "../clients/rss.queries"
import { CoverImage } from "../components/CoverImage"
import { EpisodeCard } from "../components/EpisodeCard"
import { PureLayout } from "../components/Layout"
import { EpisodesList } from "../components/PureEpisodeFlatList"
import { PureXStack, PureYStack } from "../components/PureStack"
import { ErrorSection } from "../components/Sections/Error"
import { LoadingSection } from "../components/Sections/LoadingSection"
import { PodcastScreenRouteProp } from "../types/navigation.types"
import { DEVICE_WIDTH } from "../utils/constants"
import { getImageFromEntity } from "../utils/image.utils"

// TODO: Fix this shit
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// TODO: Fix this shit
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const month = date.toLocaleString("default", { month: "short" })
  const day = date.getDate()
  const year = date.getFullYear()

  return `${month} ${day}, ${year}`
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

// TODO: Use the local episodes query
function usePodcastTrackCount(podcast: { rssFeedUrl: string | null } | undefined) {
  const { data: episodes, error: fetchedEpisodesError, isLoading } = useGetRssEpisodesQuery(podcast?.rssFeedUrl || null)

  return episodes?.length || 0
}

export function LocalPodcastScreen({ id }: { id: string }) {
  const { data: localPodcast, isLoading: isLocalLoading } = useGetLocalPodcastQuery(id)
  const { data: localEpisodes, isLoading: isLocalEpisodesLoading } = useGetLocalEpisodesByPodcastIdQuery(id)

  const { mutateAsync: removePodcast, isPending: isRemoving } = useRemovePodcastMutation()

  if (isLocalLoading || !localPodcast) {
    return <LoadingSection />
  }

  return (
    <PureLayout>
      {/* About Section */}
      <PureXStack px="$3" centered gap="$3">
        <PureYStack>
          <CoverImage entity={localPodcast} size={DEVICE_WIDTH * 0.4} />
        </PureYStack>
        <PureYStack flex={1}>
          <PureYStack flex={1} jc="flex-start" ai="flex-start">
            <H4 textAlign="center" numberOfLines={2}>
              {localPodcast.title}
            </H4>
            <Paragraph size="$4">Author(s): {localPodcast.author}</Paragraph>
            <Paragraph size="$4">Episodes: {localEpisodes?.length}</Paragraph>
          </PureYStack>
          <Button onPress={() => removePodcast(String(localPodcast.appleId))} icon={isRemoving ? null : Minus}>
            {isRemoving ? <Spinner /> : <Paragraph size="$3">Remove from Library</Paragraph>}
          </Button>
        </PureYStack>
      </PureXStack>

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
    <EpisodesList
      podcastTitle={localPodcast.title}
      episodes={localEpisodes.map((episode) => ({ ...episode, podcastId: localPodcast.appleId })) || []}
      renderItem={({ item }) => {
        // TODO: Use date-fns to render this correctly
        const publishedAt = formatDate(Number(item.publishedAt))
        const duration = formatDuration(item.duration)

        return (
          <EpisodeCard
            title={item.title}
            subtitle={item.description}
            image={getImageFromEntity(item, "100")}
            extraInfo={`${publishedAt} • ${duration}`}
            podcastTitle={localPodcast.title}
            onPress={() => {
              if (!item.rssId) {
                throw new Error("Found episode without an rssId")
              }

              navigation.navigate("Episode", { episodeId: item.rssId, podcastId: String(item.podcastId) })
            }}
          />
        )
      }}
    />
  )
}

export function RemotePodcastScreen({ id }: { id: string }) {
  const { data, isLoading, error } = useGetItunesPodcastAndEpisodesQuery(id ?? null)

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
      <PureXStack px="$3" centered gap="$3">
        <PureYStack>
          <CoverImage entity={podcast} size={DEVICE_WIDTH * 0.4} />
        </PureYStack>
        <PureYStack flex={1}>
          <PureYStack flex={1} jc="flex-start" ai="flex-start">
            <H4 textAlign="center" numberOfLines={2}>
              {podcast.title}
            </H4>
            <Paragraph size="$4">Author(s): {podcast.author}</Paragraph>
            {/* <Paragraph size="$4">Episodes: {trackCount}</Paragraph> */}
          </PureYStack>
          <PureYStack gap="$2" jc="flex-end">
            <Button icon={isUpdatingLocal ? null : Plus} onPress={() => savePodcast({ podcast })}>
              {isUpdatingLocal ? <Spinner /> : <Paragraph size="$3">Add to Library</Paragraph>}
            </Button>
          </PureYStack>
        </PureYStack>
      </PureXStack>

      {/* Episodes Section */}
      <PureYStack flex={1} pt="$3">
        <RemoteEpisodesSection id={id} />
      </PureYStack>
    </PureLayout>
  )
}

export function RemoteEpisodesSection({ id }: { id: string }) {
  const { data, isLoading } = useGetItunesPodcastAndEpisodesQuery(id)
  const podcast = data?.podcast
  const episodes = data?.episodes

  if (isLoading || !podcast || !episodes) {
    return (
      <PureYStack centered flex={1}>
        <Spinner />
      </PureYStack>
    )
  }

  return (
    <EpisodesList
      podcastTitle={podcast.title}
      episodes={
        episodes.map((episode) => ({
          ...episode,
          //
          podcastId: podcast.appleId,
          duration: episode.duration || null,
        })) || []
      }
      renderItem={({ item }) => {
        // TODO: Use date-fns to render this correctly
        const publishedAt = formatDate(Number(item.publishedAt))
        const duration = formatDuration(item.duration || 0)

        return (
          <EpisodeCard
            title={item.title}
            subtitle={item.description}
            image={getImageFromEntity(item, "100")}
            extraInfo={`${publishedAt} • ${duration}`}
            podcastTitle={podcast.title}
            cardProps={{
              opacity: 0.5,
            }}
          />
        )
      }}
    />
  )
}
