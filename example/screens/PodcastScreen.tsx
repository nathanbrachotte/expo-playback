import { useRoute } from "@react-navigation/native"
import { Minus } from "@tamagui/lucide-icons"
import { H4, Paragraph, YStack, XStack, Spinner, Button, H2 } from "tamagui"

import { useGetPodcastByIdQuery } from "../clients/both.queries"
import { useRemovePodcastMutation, useSavePodcastMutation } from "../clients/local.mutations"
import { useGetRssEpisodesQuery } from "../clients/rss.queries"
import { CoverImage } from "../components/CoverImage"
import { PureLayout } from "../components/Layout"
import { EpisodesList } from "../components/PureEpisodeList"
import { PureXStack, PureYStack } from "../components/PureStack"
import { ErrorSection } from "../components/Sections/Error"
import { Plus } from "@tamagui/lucide-icons"
import { LoadingSection } from "../components/Sections/LoadingSection"
import { PodcastScreenRouteProp } from "../types/navigation.types"
import { DEVICE_WIDTH } from "../utils/constants"

function usePodcastTrackCount(podcast: { rssFeedUrl: string | null } | undefined) {
  const { data: episodes, error: fetchedEpisodesError, isLoading } = useGetRssEpisodesQuery(podcast?.rssFeedUrl || null)

  return episodes?.length || 0
}

export function PodcastScreen() {
  const route = useRoute<PodcastScreenRouteProp>()

  const { id } = route.params

  const { podcast, isLoading, isLocal } = useGetPodcastByIdQuery(id ?? null)
  const trackCount = usePodcastTrackCount(podcast)
  const { mutateAsync: savePodcast, isPending: isSaving } = useSavePodcastMutation({
    podcastId: id ?? "unknown",
  })
  const { mutateAsync: removePodcast, isPending: isRemoving } = useRemovePodcastMutation()

  if (!id) {
    return <ErrorSection />
  }

  if (isLoading) {
    return <LoadingSection />
  }

  if (!podcast) {
    return (
      <PureLayout header={<H4>Podcast</H4>}>
        <Paragraph>Podcast not found</Paragraph>
      </PureLayout>
    )
  }

  const isUpdatingLocal = isSaving || isRemoving
  console.log("🚀 ~ PodcastScreen ~ isRemoving:", isRemoving)
  console.log("🚀 ~ PodcastScreen ~ isSaving:", isSaving)
  console.log("🚀 ~ PodcastScreen ~ isUpdatingLocal:", isUpdatingLocal)

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
            <Paragraph size="$4">Episodes: {trackCount}</Paragraph>
          </PureYStack>
          {!isLocal ? (
            <PureYStack gap="$2" jc="flex-end">
              <Button icon={isUpdatingLocal ? null : Plus} onPress={() => savePodcast({ podcast })}>
                {isUpdatingLocal ? <Spinner /> : <Paragraph size="$3">Add to Library</Paragraph>}
              </Button>
            </PureYStack>
          ) : (
            <Button onPress={() => removePodcast(String(podcast.appleId))} icon={isUpdatingLocal ? null : Minus}>
              {isUpdatingLocal ? <Spinner /> : <Paragraph size="$3">Remove from Library</Paragraph>}
            </Button>
          )}
        </PureYStack>
      </PureXStack>

      {/* Episodes Section */}
      <PureYStack flex={1} pt="$3">
        <EpisodesSection id={id} />
      </PureYStack>
    </PureLayout>
  )
}

export function EpisodesSection({ id }: { id: string }) {
  const { podcast } = useGetPodcastByIdQuery(id)
  const { data: episodes, error: fetchedEpisodesError, isLoading } = useGetRssEpisodesQuery(podcast?.rssFeedUrl || null)

  if (isLoading || !podcast) {
    return (
      <PureYStack centered flex={1}>
        <Spinner />
      </PureYStack>
    )
  }

  if (!episodes || fetchedEpisodesError) {
    console.error(fetchedEpisodesError)
    return <ErrorSection />
  }

  return (
    <EpisodesList
      podcastTitle={podcast.title}
      episodes={episodes.map((episode) => ({ ...episode, podcastId: podcast.appleId })) || []}
    />
  )
}
