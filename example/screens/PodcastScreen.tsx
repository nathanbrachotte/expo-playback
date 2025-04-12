import { useRoute } from "@react-navigation/native"
import { Image } from "react-native"
import { H4, Paragraph, YStack, XStack, Spinner } from "tamagui"

import { useGetPodcastByIdQuery } from "../clients/both.queries"
import { useGetItunesEpisodesQuery } from "../clients/itunes.queries"
import { EpisodesList } from "../components/EpisodeList"
import { PureLayout } from "../components/Layout"
import { ErrorSection } from "../components/Sections/Error"
import { LoadingSection } from "../components/Sections/LoadingSection"
import { PodcastScreenRouteProp } from "../types/navigation.types"

export function EpisodesSection({ id }: { id: string }) {
  const {
    data: fetchedEpisodesResponse,
    error: fetchedEpisodesError,
    isLoading,
  } = useGetItunesEpisodesQuery(id || null)
  const episodes = fetchedEpisodesResponse?.episodes

  if (isLoading) {
    return <Spinner />
  }

  if (!episodes) {
    return <ErrorSection />
  }

  return <EpisodesList episodes={episodes || []} />
}

export function PodcastScreen() {
  const route = useRoute<PodcastScreenRouteProp>()
  // Could be the local id or the appleId
  const { id } = route.params

  const { podcast, isLoading } = useGetPodcastByIdQuery(id ?? null)
  console.log("🚀 ~ PodcastScreen ~ podcast:", podcast)

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

  return (
    <PureLayout header={<H4>Podcast</H4>}>
      <YStack gap="$4" p="$4">
        <XStack gap="$4" alignItems="center">
          {podcast.image ? (
            <Image
              source={{ uri: podcast.image }}
              style={{ width: 120, height: 120, borderRadius: 12 }}
              resizeMode="cover"
            />
          ) : null}
          <YStack gap="$2" flex={1}>
            <Paragraph size="$8" fontWeight="bold">
              {podcast.title}
            </Paragraph>
            <Paragraph size="$5">{podcast.author}</Paragraph>
            <Paragraph size="$3" color="$gray11">
              {podcast.author} • TODO episodes
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
