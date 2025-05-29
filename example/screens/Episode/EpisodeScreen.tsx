import { useNavigation, useNavigationState, useRoute } from "@react-navigation/native"
import { Ellipsis } from "@tamagui/lucide-icons"
import ExpoPlaybackModule from "expo-playback/ExpoPlaybackModule"
import { useCallback } from "react"
import { useWindowDimensions } from "react-native"
import RenderHtml from "react-native-render-html"
import { Button, H3, H4, Paragraph, useTheme, Image } from "tamagui"
import { z } from "zod"

import { useSavePodcastMutation } from "../../clients/local.mutations"
import {
  getEpisodeWithPodcastByExternalId,
  useGetLiveLocalEpisodeQuery,
} from "../../clients/local.queries"
import { PureLayout } from "../../components/Layout"
import { PureScrollView } from "../../components/PureScrollview"
import { PureXStack, PureYStack } from "../../components/PureStack"
import { CustomButtonIcon, GhostButton, PlayButton } from "../../components/buttons"
import { usePlayerContext } from "../../providers/PlayerProvider"
import { LocalEpisode, LocalEpisodeMetadata, LocalPodcast } from "../../types/db.types"
import { EpisodeScreenRouteProp } from "../../types/navigation.types"
import { getImageFromEntity } from "../../utils/image.utils"
import { getEpisodeStateFromMetadata } from "../../utils/metadata"
import { DurationAndDateSection, EpisodeTitle } from "../../components/episode"

const podcastRouteSchema = z.object({
  name: z.literal("Podcast"),
  params: z.object({
    id: z.string().optional(),
  }),
})

export function EpisodeDescription({ description }: { description: string }) {
  const { width } = useWindowDimensions()
  const theme = useTheme()

  const source = {
    html: `
      <body style="
        background-color: ${theme.background.val};
        color: ${theme.color.val};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 1.5;
        padding: 16px;
      ">
        ${description}
      </body>
    `,
  }

  return <RenderHtml contentWidth={width} source={source} />
}

function PodcastButton({ podcast }: { podcast: LocalPodcast }) {
  const navigation = useNavigation()
  const routes = useNavigationState((state) => state?.routes || [])

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
    return null
  }

  return (
    <Button
      onPress={goToPodcast}
      borderRadius="$4"
      pl="$2"
      pr="$3"
      // variant="outlined"
    >
      <PureXStack gap="$3" ai="center" jc="flex-start">
        <Image
          source={{ uri: getImageFromEntity(podcast, "100") || "" }}
          w="$3"
          h="$3"
          borderRadius="$2"
          flexShrink={0}
        />
        <Paragraph size="$6" numberOfLines={1} flex={1} maxWidth="100%">
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
  const podcastImage = getImageFromEntity(podcast, "100")
  const episodeImage = getImageFromEntity(episode, "100")
  const image = episodeImage || podcastImage

  return (
    <PureLayout>
      <PureYStack m="$-8" mb="$0">
        {image ? (
          <Image alignSelf="center" source={{ uri: image }} w="$16" h="$16" borderRadius="$2" />
        ) : null}
      </PureYStack>
      <PureYStack flex={1} mt="$4" px="$2">
        <EpisodeTitle
          title={episode.title}
          isFinished={episodeMetadata?.isFinished}
          Component={H3}
          componentProps={{ size: "$8", fontWeight: "bold", textAlign: "left" }}
        />
        <PureXStack>
          <DurationAndDateSection
            duration={episode.duration}
            date={episode.publishedAt}
            isFinished={episodeMetadata?.isFinished}
          />
        </PureXStack>
        <PureXStack mt="$2" justifyContent="space-between">
          <PureXStack maxWidth="70%">
            <PodcastButton podcast={podcast} />
          </PureXStack>
          <PureXStack gap="$2" centered width="30%" justifyContent="flex-end">
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

        <PureScrollView>
          <EpisodeDescription description={episode.description} />
        </PureScrollView>
      </PureYStack>
    </PureLayout>
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
      <PureLayout header={<H4>Episode</H4>}>
        <PureYStack f={1} centered>
          <Paragraph>Could not find Episode :(</Paragraph>
        </PureYStack>
      </PureLayout>
    )
  }

  return <EpisodeDumbScreen episode={episode} podcast={podcast} episodeMetadata={episodeMetadata} />
}
