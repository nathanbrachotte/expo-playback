import { useNavigation } from "@react-navigation/native"
import { Cog, Plus, Search } from "@tamagui/lucide-icons"
import React from "react"
import { Button, XStack, H2, ScrollView, Paragraph, YStack, H5 } from "tamagui"

import { PurecastLogo } from "../assets/PurecastLogo"
import { useLocalPodcastsQuery } from "../clients/local.queries"
import { AllEpisodesList } from "../components/AllEpisodesSection"
import { PureLayout } from "../components/Layout"
import { PodcastCard } from "../components/PodcastCard"
import { PureSection } from "../components/Sections/PureSection"
import { TestSection } from "../components/TestSection"

function PodcastsList() {
  const { data: podcastList } = useLocalPodcastsQuery()

  return (
    <ScrollView horizontal>
      {podcastList?.map((podcast) => (
        <PodcastCard
          id={String(podcast.id)}
          key={podcast.id}
          title={podcast.title}
          author={podcast.author}
          description={podcast.description}
          cover={podcast.image}
          mt="$2"
          mr="$3"
        />
      ))}
    </ScrollView>
  )
}

function PodcastsSection() {
  return (
    <PureSection.Wrapper>
      <PureSection.Title>My podcasts</PureSection.Title>
      <PodcastsList />
    </PureSection.Wrapper>
  )
}

function AllEpisodesSection() {
  const { data: podcastList } = useLocalPodcastsQuery()

  if (podcastList?.length === 0) {
    return null
  }

  return (
    <PureSection.Wrapper>
      <PureSection.Title>Episodes</PureSection.Title>
      <AllEpisodesList />
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
          <PodcastsSection />
          <AllEpisodesSection />
        </>
      ) : (
        <EmptyState />
      )}
    </PureLayout>
  )
}
