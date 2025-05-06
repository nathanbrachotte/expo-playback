import { useNavigation, useRoute, useNavigationState } from "@react-navigation/native"
import { ArrowBigRight, Download, Play, Share } from "@tamagui/lucide-icons"
import { Image, useWindowDimensions } from "react-native"
import RenderHtml from "react-native-render-html"
import { H4, Paragraph, YStack, XStack, Button, useTheme, H3 } from "tamagui"
import { z } from "zod"

import { useSavePodcastMutation } from "../../clients/local.mutations"
import { getEpisodeWithPodcastByExternalId, useGetLiveLocalEpisodeQuery } from "../../clients/local.queries"
import { PureLayout } from "../../components/Layout"
import { PureScrollView } from "../../components/PureScrollview"
import { PureXStack, PureYStack } from "../../components/PureStack"
import { usePlayerContext } from "../../providers/PlayerProvider"
import { LocalEpisode, LocalPodcast } from "../../types/db.types"
import { EpisodeScreenRouteProp } from "../../types/navigation.types"
import { getImageFromEntity } from "../../utils/image.utils"

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

function EpisodeDumbScreen({ episode, podcast }: { episode: LocalEpisode; podcast: LocalPodcast }) {
  const navigation = useNavigation()
  const { setActiveEpisodeId } = usePlayerContext()

  const { mutateAsync: savePodcast } = useSavePodcastMutation({
    podcastId: podcast.id?.toString() || podcast.appleId?.toString() || "",
  })

  const routes = useNavigationState((state) => state?.routes || [])

  const isPodcastScreenInStack = routes.some((route) => {
    const result = podcastRouteSchema.safeParse(route)
    return result.success && result.data.params.id === (podcast.id?.toString() || podcast.appleId?.toString())
  })

  const downloadAndPlay = async () => {
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

    // ExpoPlaybackModule.startBackgroundDownload(1)
    // If episode exists locally, set it as active directly
    // setActiveEpisodeId(1)
  }

  const goToPodcast = () => {
    navigation.navigate("Podcast", {
      id: podcast.id?.toString() || podcast.appleId?.toString(),
    })
  }

  const podcastImage = getImageFromEntity(podcast, "100")
  const episodeImage = getImageFromEntity(episode, "100")
  const image = episodeImage || podcastImage

  return (
    <PureLayout>
      <PureYStack gap="$3" flex={1} overflow="hidden">
        <PureXStack px="$3" gap="$4" alignItems="center" centered>
          {image ? (
            <Image source={{ uri: image }} style={{ width: 120, height: 120, borderRadius: 12 }} resizeMode="cover" />
          ) : null}
        </PureXStack>
        <YStack flex={1}>
          <H3 px="$3" fontWeight="bold" textAlign="left">
            {episode.title}
          </H3>
          <Paragraph px="$3">
            <Paragraph fontWeight="bold">Release Date:</Paragraph> {new Date(episode.publishedAt).toLocaleDateString()}
          </Paragraph>

          <PureScrollView>
            <EpisodeDescription description={episode.description} />
          </PureScrollView>
        </YStack>
      </PureYStack>
      <PureYStack gap="$2" centered>
        <PureXStack gap="$2" centered>
          <Button icon={Download} />
          <Button icon={Play} onPress={downloadAndPlay} />
          <Button icon={Share} />
        </PureXStack>
        {!isPodcastScreenInStack && (
          <Button onPress={goToPodcast} icon={ArrowBigRight} width="$14">
            <Button.Text>Podcast</Button.Text>
          </Button>
        )}
      </PureYStack>
    </PureLayout>
  )
}

export function EpisodeScreen() {
  const route = useRoute<EpisodeScreenRouteProp>()
  const { episodeId, podcastId } = route.params
  console.log("🚀 ~ EpisodeScreen ~ episodeId:", episodeId)
  const { data: localEpisode, error, updatedAt } = useGetLiveLocalEpisodeQuery({ id: episodeId })
  console.log("🚀 ~ EpisodeScreen ~ localEpisode:", localEpisode)
  console.log("🚀 ~ EpisodeScreen ~ error:", error)
  console.log("🚀 ~ EpisodeScreen ~ updatedAt:", updatedAt)

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

  if (!episode || !podcast) {
    return (
      <PureLayout header={<H4>Episode</H4>}>
        <PureYStack f={1} centered>
          <Paragraph>Could not find Episode :(</Paragraph>
        </PureYStack>
      </PureLayout>
    )
  }

  return <EpisodeDumbScreen episode={episode} podcast={podcast} />
}
