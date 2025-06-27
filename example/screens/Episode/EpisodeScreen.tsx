import { useNavigation, useNavigationState, useRoute } from "@react-navigation/native"
import ExpoPlaybackModule from "expo-playback/ExpoPlaybackModule"
import { useCallback } from "react"
import { useWindowDimensions } from "react-native"
import { Button, H3, H4, Paragraph } from "tamagui"
import { z } from "zod"

import { useGetLiveLocalEpisodeQuery } from "../../clients/local.queries"
import { PlayButton } from "../../components/buttons"
import {
  DurationAndDateSection,
  EpisodeActionSheet,
  EpisodeDescriptionHtml,
} from "../../components/episode"
import { PureImage } from "../../components/image"
import { PLayout } from "../../components/Layout"
import { PureScrollView } from "../../components/PureScrollview"
import { PureXStack, PureYStack } from "../../components/PureStack"
import { SECTION_PADDING_VALUE } from "../../components/Sections/PureSection"
import { LocalEpisode, LocalEpisodeMetadata, LocalPodcast } from "../../types/db.types"
import { EpisodeScreenRouteProp } from "../../types/navigation.types"
import { getImageFromEntities, getImageFromEntity } from "../../utils/image.utils"
import { getEpisodeStateFromMetadata } from "../../utils/metadata.utils"

const podcastRouteSchema = z.object({
  name: z.literal("Podcast"),
  params: z.object({
    id: z.string().optional(),
  }),
})

function PodcastButton({ podcast }: { podcast: LocalPodcast }) {
  const navigation = useNavigation()
  const routes = useNavigationState((state) => state?.routes || [])
  const { width } = useWindowDimensions()

  const isPodcastScreenInStack = routes.some((route) => {
    const result = podcastRouteSchema.safeParse(route)
    return (
      result.success &&
      result.data.params.id === (podcast.id?.toString() || podcast.appleId?.toString())
    )
  })

  const goToPodcast = () => {
    navigation.navigate("Podcast", {
      id: podcast.id?.toString() || podcast.appleId?.toString(),
    })
  }

  if (isPodcastScreenInStack) {
    return <PureXStack />
  }

  return (
    <Button
      onPress={goToPodcast}
      borderRadius="$4"
      pl="$2"
      pr="$3"
      alignSelf="flex-start"
      maxWidth={width * 0.7}
    >
      <PureXStack gap="$3" ai="center">
        <PureImage
          uri={getImageFromEntity(podcast, "100") || ""}
          width="$3"
          height="$3"
          borderRadius="$2"
          flexShrink={0}
        />
        <Paragraph size="$6" numberOfLines={1} maxWidth={width * 0.7 - 80}>
          {podcast.title}
        </Paragraph>
      </PureXStack>
    </Button>
  )
}

function PlayEpisodeButton({
  episodeId,
  episodeMetadata,
}: {
  episodeId: number
  episodeMetadata: LocalEpisodeMetadata | null
}) {
  const handlePlay = useCallback(async () => {
    if (episodeId) {
      return
    }

    ExpoPlaybackModule.play(episodeId)
  }, [episodeId])

  if (!episodeMetadata) {
    return <PlayButton isDownloaded={false} isDownloading={false} episodeId={episodeId} size="$5" />
  }

  const { isDownloaded, isDownloading } = getEpisodeStateFromMetadata(episodeMetadata)

  return (
    <PlayButton
      isDownloaded={isDownloaded}
      isDownloading={isDownloading}
      size="$5"
      episodeId={episodeId}
      onPress={handlePlay}
    />
  )
}

function EpisodeDumbScreen({
  episode,
  podcast,
  episodeMetadata,
}: {
  episode: LocalEpisode
  podcast: LocalPodcast
  episodeMetadata: LocalEpisodeMetadata | null
}) {
  const image = getImageFromEntities(episode, podcast, "600")
  const prettyMetadata = episodeMetadata ? getEpisodeStateFromMetadata(episodeMetadata) : null

  return (
    <PLayout.Screen>
      <PLayout.Container px="$3">
        <PureYStack m="$-8" mb="$0">
          {image ? (
            <PureImage alignSelf="center" uri={image} width="$16" height="$16" borderRadius="$2" />
          ) : null}
        </PureYStack>
        <PureYStack mt="$2">
          <PureXStack jc="flex-start" ai="flex-start" gap="$1">
            <H3 fontWeight="bold">{episode.title}</H3>
          </PureXStack>
        </PureYStack>
        <PureXStack>
          <DurationAndDateSection
            duration={prettyMetadata?.duration || episode.duration}
            date={episode.publishedAt}
            isFinished={episodeMetadata?.isFinished}
          />
        </PureXStack>
        <PureXStack mt="$2" justifyContent="space-between" ai="center">
          {/* PureXStack - Important for layout to work */}
          <PureXStack>
            <PodcastButton podcast={podcast} />
          </PureXStack>
          <PureXStack gap="$2" centered width="30%">
            <EpisodeActionSheet
              episodeId={episode.id}
              isDownloaded={prettyMetadata?.isDownloaded}
            />
            <PlayEpisodeButton episodeId={episode.id} episodeMetadata={episodeMetadata} />
          </PureXStack>
        </PureXStack>
        <PureYStack mt="$2" mx="$-3" flex={1}>
          <PureScrollView
            scrollViewProps={{
              contentContainerStyle: { paddingHorizontal: SECTION_PADDING_VALUE / 2 },
            }}
          >
            <EpisodeDescriptionHtml description={episode.description} />
          </PureScrollView>
        </PureYStack>
      </PLayout.Container>
    </PLayout.Screen>
  )
}

export function EpisodeScreen() {
  const route = useRoute<EpisodeScreenRouteProp>()
  const { episodeId, podcastId } = route.params
  const { data: localEpisode, error, updatedAt } = useGetLiveLocalEpisodeQuery({ id: episodeId })

  // if (isLoading) {
  //   return (
  //     <PureLayout header={<H4>Episode</H4>}>
  //       <PureYStack f={1} centered>
  //         <Spinner />
  //       </PureYStack>
  //     </PureLayout>
  //   )
  // }

  const episode = localEpisode[0]?.episode
  const podcast = localEpisode[0]?.podcast
  const episodeMetadata = localEpisode[0]?.episodeMetadata

  // TODO: Remove this and assume the episode exist?
  // This is fucked because of the livequery bs
  if (!episode || !podcast) {
    return (
      <PLayout.Screen header={<H4>Episode</H4>}>
        <PureYStack f={1} centered>
          <Paragraph>Could not find Episode :(</Paragraph>
        </PureYStack>
      </PLayout.Screen>
    )
  }

  return <EpisodeDumbScreen episode={episode} podcast={podcast} episodeMetadata={episodeMetadata} />
}
