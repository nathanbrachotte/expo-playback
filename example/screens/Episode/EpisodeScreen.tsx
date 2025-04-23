import { useNavigation, useRoute } from "@react-navigation/native"
import { ArrowBigRight, Download, Play, Share } from "@tamagui/lucide-icons"
import { Image } from "react-native"
import { H4, Paragraph, YStack, XStack, Button, Spinner } from "tamagui"

import { useGetEpisodeByIdQuery } from "../../clients/both.queries"
import { useSavePodcastMutation } from "../../clients/local.mutations"
import { PureLayout } from "../../components/Layout"
import { PureScrollView } from "../../components/PureScrollview"
import { PureXStack, PureYStack } from "../../components/PureStack"
import { usePlayerContext } from "../../providers/PlayerProvider"
import { SharedEpisodeFields } from "../../types/db.types"
import { EpisodeScreenRouteProp } from "../../types/navigation.types"
import { getAppleIdFromPodcast } from "../../utils/podcasts.utils"

function EpisodeDumbScreen({
  episode,
  podcast,
}: {
  episode: SharedEpisodeFields
  podcast: {
    id?: number
    appleId?: number
  }
}) {
  const navigation = useNavigation()
  const { setActiveEpisodeId } = usePlayerContext()
  const { handleSavePodcast } = useSavePodcastMutation()

  const downloadAndPlay = async () => {
    const res = await handleSavePodcast(getAppleIdFromPodcast(podcast))
    // TODO: Verify this works
    const savedEpisodeId = res?.savedEpisodes.lastInsertRowId
    if (!savedEpisodeId) {
      throw new Error("Something when wrong when saving the podcast: " + JSON.stringify(res, null, 2))
    }
    setActiveEpisodeId(savedEpisodeId)
  }

  const goToPodcast = () => {
    navigation.navigate("Podcast", {
      id: podcast.id?.toString() || podcast.appleId?.toString(),
    })
  }

  return (
    <PureLayout header={<H4>Episode</H4>}>
      <PureScrollView>
        <PureYStack gap="$3" p="$3" flex={1}>
          <XStack gap="$4" alignItems="center">
            {episode.image ? (
              <Image
                source={{ uri: episode.image }}
                style={{ width: 120, height: 120, borderRadius: 12 }}
                resizeMode="cover"
              />
            ) : null}
          </XStack>
          <YStack gap="$2" flex={1}>
            <Paragraph size="$8" fontWeight="bold">
              {episode.title} - {episode.podcastId} - {episode.appleId}
            </Paragraph>

            <Paragraph>
              <Paragraph fontWeight="bold">Release Date:</Paragraph>{" "}
              {new Date(episode.publishedAt).toLocaleDateString()}
            </Paragraph>

            {/* // TODO: Make sure the formatting works! */}
            <Paragraph size="$5">{episode.description}</Paragraph>
          </YStack>
        </PureYStack>
        <PureYStack gap="$2" centered>
          <PureXStack gap="$2" centered>
            <Button icon={Download} />
            <Button icon={Play} onPress={downloadAndPlay} />
            <Button icon={Share} />
          </PureXStack>
          <Button onPress={goToPodcast} icon={ArrowBigRight} width="$14">
            <Button.Text>Podcast</Button.Text>
          </Button>
        </PureYStack>
      </PureScrollView>
    </PureLayout>
  )
}

export function EpisodeScreen() {
  const route = useRoute<EpisodeScreenRouteProp>()

  const { episodeId, podcastId } = route.params

  const { episode, podcast, isLoading } = useGetEpisodeByIdQuery({ episodeId, podcastId })

  if (isLoading) {
    return (
      <PureLayout header={<H4>Episode</H4>}>
        <PureYStack f={1} centered>
          <Spinner />
        </PureYStack>
      </PureLayout>
    )
  }

  if (!episode) {
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
