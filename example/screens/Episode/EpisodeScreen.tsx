import { useNavigation, useRoute } from "@react-navigation/native"
import { Image } from "react-native"
import { H4, Paragraph, ScrollView, YStack, XStack, Button, Spinner } from "tamagui"

import { useGetItunesEpisodesQuery } from "../../clients/itunes.queries"
import { useGetLiveLocalEpisodeQuery } from "../../clients/local.queries"
import { PureSection } from "../../components/Sections/PureSection"
import { PureLayout } from "../../components/Layout"
import { SharedEpisodeFields } from "../../types/db.types"
import { EpisodeScreenRouteProp } from "../../types/navigation.types"
import { useGetEpisodeByIdQuery } from "../../clients/both.queries"
import { PureYStack } from "../../components/PureStack"

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

  const goToPodcast = () => {
    navigation.navigate("Podcast", {
      id: podcast.id?.toString() || podcast.appleId?.toString(),
      // appleId: podcast.appleId?.toString(),
    })
  }

  return (
    <PureLayout header={<H4>Episode</H4>}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$4" p="$4">
          <Button onPress={goToPodcast}>
            <Button.Text>Go to Podcast</Button.Text>
          </Button>
          <XStack gap="$4" alignItems="center">
            {episode.image ? (
              <Image
                source={{ uri: episode.image }}
                style={{ width: 120, height: 120, borderRadius: 12 }}
                resizeMode="cover"
              />
            ) : null}
            <YStack gap="$2" flex={1}>
              <Paragraph size="$8" fontWeight="bold">
                {episode.title}
              </Paragraph>
              <Paragraph size="$5">{episode.description}</Paragraph>
            </YStack>
          </XStack>

          <YStack gap="$2">
            <Paragraph size="$3">
              <Paragraph fontWeight="bold">Release Date:</Paragraph>{" "}
              {new Date(episode.publishedAt).toLocaleDateString()}
            </Paragraph>
          </YStack>
        </YStack>
      </ScrollView>
    </PureLayout>
  )
}

export function EpisodeScreen() {
  const route = useRoute<EpisodeScreenRouteProp>()

  const { id } = route.params

  const { episode, podcast, isLoading } = useGetEpisodeByIdQuery(id)
  console.log("🚀 ~ EpisodeScreen ~ episode:", episode)
  console.log("🚀 ~ EpisodeScreen ~ isLoading:", isLoading)
  console.log("🚀 ~ EpisodeScreen ~ podcast:", podcast)

  if (isLoading) {
    return <Spinner />
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
