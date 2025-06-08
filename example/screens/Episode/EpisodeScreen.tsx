import { useNavigation, useNavigationState, useRoute } from "@react-navigation/native"
import { Ellipsis } from "@tamagui/lucide-icons"
import ExpoPlaybackModule from "expo-playback/ExpoPlaybackModule"
import { useCallback } from "react"
import { useWindowDimensions } from "react-native"
import { Button, H3, H4, Paragraph } from "tamagui"
import { z } from "zod"

import { useSavePodcastMutation } from "../../clients/local.mutations"
import {
  getEpisodeWithPodcastByExternalId,
  useGetLiveLocalEpisodeQuery,
} from "../../clients/local.queries"
import { PLayout } from "../../components/Layout"
import { PureScrollView } from "../../components/PureScrollview"
import { PureXStack, PureYStack } from "../../components/PureStack"
import { CustomButtonIcon, GhostButton, PlayButton } from "../../components/buttons"
import { usePlayerContext } from "../../providers/PlayerProvider"
import { LocalEpisode, LocalEpisodeMetadata, LocalPodcast } from "../../types/db.types"
import { EpisodeScreenRouteProp } from "../../types/navigation.types"
import { getImageFromEntity } from "../../utils/image.utils"
import { getEpisodeStateFromMetadata } from "../../utils/metadata.utils"
import { DurationAndDateSection, EpisodeDescriptionHtml } from "../../components/episode"
import { PureImage } from "../../components/image"
import { SECTION_PADDING_VALUE } from "../../components/Sections/PureSection"

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
  episode,
  podcast,
  episodeMetadata,
}: {
  episode: LocalEpisode
  podcast: LocalPodcast
  episodeMetadata: LocalEpisodeMetadata | null
}) {
  console.log("🚀 ~ PlayEpisodeButton ~ podcast:", JSON.stringify(podcast, null, 2))
  console.log("🚀 ~ PlayEpisodeButton ~ episode:", JSON.stringify(episode, null, 2))
  const { setActiveEpisodeId } = usePlayerContext()

  const { mutateAsync: savePodcast } = useSavePodcastMutation({
    podcastId: podcast.id?.toString() || podcast.appleId?.toString() || "",
  })

  // TODO: Erik, figure out what's needed from this still, but most could be extracted to the button imo
  const handlePlay = useCallback(async () => {
    // @ts-ignore ds
    console.log("🚀 ~ downloadAndPlay ~ episode:", JSON.stringify(episode, null, 2))
    // @ts-ignore ds
    const res = await getEpisodeWithPodcastByExternalId(episode.id)
    console.log("🚀 ~ downloadAndPlay ~ res:", res)
    const localEpisode = res?.episode
    console.log("🚀 ~ downloadAndPlay ~ localEpisode:", localEpisode)

    // If episode does not exist locally, save it
    // if (localEpisode == null) {
    //   const appleId = getAppleIdFromPodcast(podcast)
    //   if (!appleId) {
    //     throw new Error("Apple ID not found for podcast: " + JSON.stringify(podcast, null, 2))
    //   }

    //   if (!podcastFromQuery) {
    //     throw new Error("Podcast not found in query")
    //   }

    //   const res = await savePodcast({ podcast: podcastFromQuery })
    //   // TODO: Verify this works
    //   const savedEpisodeId = res?.savedEpisodes.lastInsertRowId
    //   if (!savedEpisodeId) {
    //     throw new Error("Something when wrong when saving the podcast: " + JSON.stringify(res, null, 2))
    //   }

    //   // TODO: Add download mechanism
    //   setActiveEpisodeId(savedEpisodeId)
    //   return
    // }
    ExpoPlaybackModule.play(episode.id)
    // If episode exists locally, set it as active directly
    // setActiveEpisodeId(1)
  }, [episode])

  if (!episodeMetadata) {
    return (
      <PlayButton isDownloaded={false} isDownloading={false} episodeId={episode.id} size="$5" />
    )
  }

  const { isDownloaded, isDownloading } = getEpisodeStateFromMetadata(episodeMetadata)

  return (
    <PlayButton
      isDownloaded={isDownloaded}
      isDownloading={isDownloading}
      size="$5"
      episodeId={episode.id}
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
  const podcastImage = getImageFromEntity(podcast, "600")
  const episodeImage = getImageFromEntity(episode, "600")
  const image = episodeImage || podcastImage

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
            duration={episode.duration}
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
            <GhostButton
              Icon={<CustomButtonIcon Component={Ellipsis} />}
              onPress={() => {}}
              // episode={episode}
              // podcast={podcast}
              // episodeMetadata={episodeMetadata}
            />
            <PlayEpisodeButton
              episode={episode}
              podcast={podcast}
              episodeMetadata={episodeMetadata}
            />
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
