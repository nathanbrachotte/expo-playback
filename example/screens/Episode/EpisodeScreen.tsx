import { useNavigation, useRoute, useNavigationState } from "@react-navigation/native"
import { ArrowBigRight, Download, Play, Share } from "@tamagui/lucide-icons"
import { Image, useWindowDimensions } from "react-native"
import RenderHtml from "react-native-render-html"
import { H4, Paragraph, YStack, XStack, Button, Spinner, useTheme } from "tamagui"
import { z } from "zod"

import { useGetEpisodeByIdQuery, useGetPodcastByIdQuery } from "../../clients/both.queries"
import { useSavePodcastMutation } from "../../clients/local.mutations"
import { getEpisodeWithPodcastById } from "../../clients/local.queries"
import { PureLayout } from "../../components/Layout"
import { PureScrollView } from "../../components/PureScrollview"
import { PureXStack, PureYStack } from "../../components/PureStack"
import { usePlayerContext } from "../../providers/PlayerProvider"
import { SharedEpisodeFields } from "../../types/db.types"
import { EpisodeScreenRouteProp } from "../../types/navigation.types"

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

function EpisodeDumbScreen({
  episode,
  podcast,
  isLocal,
}: {
  episode: SharedEpisodeFields
  podcast: {
    id?: number
    appleId?: number
  }
  isLocal: boolean
}) {
  const navigation = useNavigation()
  const { setActiveEpisodeId } = usePlayerContext()
  const { handleSavePodcast } = useSavePodcastMutation()
  const routes = useNavigationState((state) => state?.routes || [])

  const isPodcastScreenInStack = routes.some((route) => {
    const result = podcastRouteSchema.safeParse(route)
    return result.success && result.data.params.id === (podcast.id?.toString() || podcast.appleId?.toString())
  })

  const downloadAndPlay = async () => {
    const res = await getEpisodeWithPodcastById(episode.appleId)
    const localEpisode = res?.episode

    // // If episode does not exist locally, save it
    // if (localEpisode == null) {
    //   const res = await handleSavePodcast(getAppleIdFromPodcast(podcast))
    //   // TODO: Verify this works
    //   const savedEpisodeId = res?.savedEpisodes.lastInsertRowId
    //   if (!savedEpisodeId) {
    //     throw new Error("Something when wrong when saving the podcast: " + JSON.stringify(res, null, 2))
    //   }

    //   // TODO: Add download mechanism
    //   setActiveEpisodeId(savedEpisodeId)
    //   return
    // }

    // If episode exists locally, set it as active directly
    setActiveEpisodeId(localEpisode.id)
  }

  const goToPodcast = () => {
    navigation.navigate("Podcast", {
      id: podcast.id?.toString() || podcast.appleId?.toString(),
    })
  }

  return (
    <PureLayout header={<H4>Episode</H4>}>
      <PureYStack gap="$3" flex={1} overflow="hidden">
        <XStack px="$3" gap="$4" alignItems="center">
          {episode.image ? (
            <Image
              source={{ uri: episode.image }}
              style={{ width: 120, height: 120, borderRadius: 12 }}
              resizeMode="cover"
            />
          ) : null}
        </XStack>
        <YStack flex={1}>
          <Paragraph px="$3" size="$8" fontWeight="bold">
            {episode.title} - {episode.podcastId} - {episode.appleId}
          </Paragraph>
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
  const { podcast } = useGetPodcastByIdQuery(podcastId)
  const { episode, isLoading, isLocal } = useGetEpisodeByIdQuery({ episodeId, feedUrl: podcast?.rssFeedUrl || null })

  if (isLoading) {
    return (
      <PureLayout header={<H4>Episode</H4>}>
        <PureYStack f={1} centered>
          <Spinner />
        </PureYStack>
      </PureLayout>
    )
  }

  if (!episode || !podcast) {
    return (
      <PureLayout header={<H4>Episode</H4>}>
        <PureYStack f={1} centered>
          <Paragraph>Could not find Episode :(</Paragraph>
        </PureYStack>
      </PureLayout>
    )
  }

  return <EpisodeDumbScreen episode={episode} podcast={podcast} isLocal={isLocal} />
}
