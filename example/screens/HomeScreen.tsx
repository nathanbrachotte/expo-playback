import { useNavigation } from "@react-navigation/native"
import {
  Bell,
  CircleDotDashed,
  Cog,
  Download,
  Plus,
  RefreshCw,
  Search,
} from "@tamagui/lucide-icons"
import React from "react"
import { Button, XStack, H2, ScrollView, YStack, H5, H3, Spinner, Paragraph } from "tamagui"

import { PurecastLogo } from "../assets/PurecastLogo"
import { useLocalPodcastsQuery } from "../clients/local.queries"
import { useFetchNewEpisodesMutation } from "../clients/rss.queries"
import { PLayout } from "../components/Layout"
import { PodcastCard } from "../components/PodcastCard"
import { PureSection } from "../components/Sections/PureSection"
import { ButtonList } from "../components/buttons"
import { getImageFromEntity } from "../utils/image.utils"
import { PureXStack, PureYStack } from "../components/PureStack"

function PodcastsList() {
  const { data: podcastList } = useLocalPodcastsQuery()

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: "$12" }} indicatorStyle="white">
      {podcastList?.map((podcast) => {
        const image = getImageFromEntity(podcast, "100")

        return (
          <PodcastCard
            id={String(podcast.id)}
            key={podcast.id}
            author={podcast.author}
            title={podcast.title}
            cover={image}
            mt="$2"
            mr="$3"
          />
        )
      })}
    </ScrollView>
  )
}

function PodcastsSection() {
  return (
    <PureSection.Wrapper f={1}>
      <PureSection.Title>Your podcasts</PureSection.Title>
      <PodcastsList />
    </PureSection.Wrapper>
  )
}

export function EmptyState() {
  const navigation = useNavigation()

  return (
    <YStack flex={1} p="$2" jc="center" ai="center">
      <H3>Welcome!</H3>
      <H5 textAlign="center">You seem to be new to Purecast.</H5>
      <H5 textAlign="center"> Get started here ⬇️</H5>
      <Button mt="$3" mb="$12" onPress={() => navigation.navigate("PodcastSearch")} icon={<Plus />}>
        <Button.Text>Add new podcasts</Button.Text>
      </Button>
    </YStack>
  )
}

export function HomeScreen() {
  const navigation = useNavigation()
  const { data: podcastList } = useLocalPodcastsQuery()
  const { mutateAsync, isPending } = useFetchNewEpisodesMutation()

  const hasSavedPodcasts = podcastList && podcastList?.length > 0

  // Fetch new episodes on app mount
  const handleRefetchNewEpisodes = () => {
    mutateAsync()
  }

  return (
    <PLayout.Screen
      header={
        <XStack justifyContent="center" alignItems="center" gap="$2">
          <H2>Purecast</H2>
          <PurecastLogo height={35} width={35} />
        </XStack>
      }
      actionSection={
        <XStack flex={1} justifyContent="flex-end" gap="$2">
          <Button icon={Search} size="$3" onPress={() => navigation.navigate("PodcastSearch")} />
          <Button icon={Cog} size="$3" onPress={() => navigation.navigate("Settings")} />
        </XStack>
      }
    >
      {/* Loading indicator for fetching new episodes */}
      {isPending ? (
        <PureXStack centered mt="$2" mb="$2" gap="$2">
          <Spinner size="small" color="$color10" />
          <Paragraph color="$color10">Fetching new episodes...</Paragraph>
        </PureXStack>
      ) : /**
       * TODO: Make this automatically fetch new episodes when the app is opened once the performances are acceptable
       */
      hasSavedPodcasts ? (
        <PureYStack centered mt="$2" mb="$2" gap="$2">
          <Button onPress={handleRefetchNewEpisodes} icon={RefreshCw}>
            <Button.Text>Fetch new episodes</Button.Text>
          </Button>
        </PureYStack>
      ) : null}

      <PureYStack flex={1}>
        {hasSavedPodcasts ? (
          <>
            <YStack px="$2" mt="$2" gap="$2">
              <ButtonList
                icon={<Bell size="$1.5" />}
                text="Latest episodes"
                onPress={() => navigation.navigate("LatestEpisodes")}
              />
              <ButtonList
                icon={<Download size="$1.5" />}
                text="Downloaded episodes"
                onPress={() => navigation.navigate("DownloadedEpisodes")}
              />
              <ButtonList
                icon={<CircleDotDashed size="$1.5" />}
                text="In progress"
                onPress={() => navigation.navigate("InProgressEpisodes")}
              />
            </YStack>
            <PodcastsSection />
          </>
        ) : (
          <EmptyState />
        )}
      </PureYStack>
    </PLayout.Screen>
  )
}
