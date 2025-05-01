import { useRoute } from "@react-navigation/native"
import { Minus, Plus } from "@tamagui/lucide-icons"
import { Image } from "react-native"
import { H4, Paragraph, YStack, XStack, Spinner, Button } from "tamagui"

import { useGetPodcastByIdQuery } from "../clients/both.queries"
import { useRemovePodcastMutation, useSavePodcastMutation } from "../clients/local.mutations"
import { useGetRssEpisodesQuery } from "../clients/rss.queries"
import { EpisodesList } from "../components/PureEpisodeList"
import { PureLayout } from "../components/Layout"
import { PureYStack } from "../components/PureStack"
import { ErrorSection } from "../components/Sections/Error"
import { LoadingSection } from "../components/Sections/LoadingSection"
import { PodcastScreenRouteProp } from "../types/navigation.types"
import { getImageFromEntity } from "../utils/image.utils"

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
    <PureYStack px="$3">
      <EpisodesList
        podcastTitle={podcast.title}
        episodes={episodes.map((episode) => ({ ...episode, podcastId: podcast.appleId })) || []}
      />
    </PureYStack>
  )
}

export function PodcastScreen() {
  const route = useRoute<PodcastScreenRouteProp>()

  const { id } = route.params

  const { podcast, isLoading, isLocal } = useGetPodcastByIdQuery(id ?? null)
  const { mutateAsync: savePodcast, isPending: isSaving } = useSavePodcastMutation()
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
  const image = getImageFromEntity(podcast, "100")

  return (
    <PureLayout header={<H4>Podcast</H4>}>
      <YStack gap="$4" p="$3">
        <XStack gap="$4" alignItems="center">
          {image ? (
            <Image source={{ uri: image }} style={{ width: 120, height: 120, borderRadius: 12 }} resizeMode="cover" />
          ) : null}
          <YStack gap="$2" flex={1}>
            <Paragraph size="$8" fontWeight="bold">
              {podcast.title} {podcast.appleId}
            </Paragraph>
            {isLocal ? (
              <Button
                w="$12"
                onPress={() => removePodcast(String(podcast.appleId))}
                icon={isUpdatingLocal ? null : Minus}
              >
                {isUpdatingLocal ? <Spinner /> : <Button.Text>Unfollow</Button.Text>}
              </Button>
            ) : (
              <Button w="$12" onPress={() => savePodcast({ podcast })} icon={isUpdatingLocal ? null : Plus}>
                {isUpdatingLocal ? <Spinner /> : <Button.Text>Follow</Button.Text>}
              </Button>
            )}
            <Paragraph size="$5">{podcast.author}</Paragraph>
            <Paragraph size="$3" color="$gray11">
              {podcast.author} • {podcast.rssFeedUrl ? "Episodes" : "No RSS feed available"}
            </Paragraph>
          </YStack>
        </XStack>

        {podcast.description ? (
          <YStack gap="$2">
            <Paragraph size="$5" fontWeight="bold">
              About
            </Paragraph>
            <Paragraph size="$4">{podcast.description}</Paragraph>
          </YStack>
        ) : null}
      </YStack>
      <EpisodesSection id={id} />
    </PureLayout>
  )
}
