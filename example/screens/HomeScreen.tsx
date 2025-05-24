import { useNavigation } from "@react-navigation/native"
import { Bell, CircleDotDashed, Cog, Download, Plus, Search } from "@tamagui/lucide-icons"
import React from "react"
import { Button, XStack, H2, ScrollView, YStack, H5, Paragraph } from "tamagui"

import { PurecastLogo } from "../assets/PurecastLogo"
import { useLocalPodcastsQuery } from "../clients/local.queries"
import { AllEpisodesList } from "../components/AllEpisodesSection"
import { PureLayout } from "../components/Layout"
import { PodcastCard } from "../components/PodcastCard"
import { PureSection } from "../components/Sections/PureSection"
import { TestSection } from "../components/TestSection"
import { getImageFromEntity } from "../utils/image.utils"
import { PureXStack } from "../components/PureStack"
import { ButtonList } from "../components/ButtonList"

function PodcastsList() {
  const { data: podcastList } = useLocalPodcastsQuery()

  return (
    <ScrollView>
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
      <H2>Welcome!</H2>
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

  const hasSavedPodcasts = podcastList && podcastList?.length > 0

  return (
    <PureLayout
      header={
        <XStack justifyContent="center" alignItems="center" gap="$2">
          <H2>Purecast</H2>
          <PurecastLogo height={35} width={35} />
        </XStack>
      }
      actionSection={
        <XStack flex={1} justifyContent="flex-end" gap="$2">
          <Button icon={<Search />} size="$3" onPress={() => navigation.navigate("PodcastSearch")} />
          <Button icon={<Cog />} size="$3" onPress={() => navigation.navigate("Settings")} />
        </XStack>
      }
    >
      <TestSection />
      {hasSavedPodcasts ? (
        <>
          <YStack px="$2" gap="$2">
            <ButtonList
              icon={<Bell size="$2" />}
              text="Latest episodes"
              onPress={() => navigation.navigate("LatestEpisodes")}
            />
            <ButtonList
              icon={<Download size="$2" />}
              text="Downloaded episodes"
              onPress={() => navigation.navigate("LatestEpisodes")}
            />
            <ButtonList
              icon={<CircleDotDashed size="$2" />}
              text="In progress"
              onPress={() => navigation.navigate("LatestEpisodes")}
            />
          </YStack>
          <PodcastsSection />
        </>
      ) : (
        <EmptyState />
      )}
    </PureLayout>
  )
}
