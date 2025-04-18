import { useNavigation } from "@react-navigation/native"
import { Search } from "@tamagui/lucide-icons"
import { useLiveQuery } from "drizzle-orm/expo-sqlite"
import React from "react"
import { Button, Text, XStack, H2, YStack, H3, ScrollView } from "tamagui"

import { PurecastLogo } from "../assets/PurecastLogo"
import { AllEpisodesSection } from "../components/AllEpisodesSection"
import { Layout } from "../components/Layout"
import { PodcastCard } from "../components/PodcastCard"
import { PURE_TOASTS } from "../components/toasts"
import { db } from "../db/client"
import { podcastsTable } from "../db/schema"
import { HomeScreenNavigationProp } from "../types/navigation"

function PodcastsList() {
  const { data: podcastList } = useLiveQuery(db.select().from(podcastsTable))

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
          mr="$3"
        />
      ))}
    </ScrollView>
  )
}
export function PodcastsSection() {
  const { data: podcastList } = useLiveQuery(db.select().from(podcastsTable))

  return (
    <YStack p="$2">
      <H3 mb="$2">All my podcasts</H3>
      {podcastList?.length ? <PodcastsList /> : <Text>No podcasts found</Text>}
    </YStack>
  )
}

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>()

  return (
    <Layout
      header={
        <XStack justifyContent="center" alignItems="center" gap="$2">
          <H2>Purecast</H2>
          <PurecastLogo height={35} width={35} />
        </XStack>
      }
      actionSection={
        <XStack flex={1} justifyContent="flex-end">
          <Button icon={<Search />} size="$3" onPress={() => navigation.navigate("PodcastSearch")} />
        </XStack>
      }
    >
      <Button size="$3" onPress={() => navigation.navigate("DatabaseExplorer")}>
        Database Explorer
      </Button>
      <PodcastsSection />
      <AllEpisodesSection />

      {/* <Player /> */}
    </Layout>
  )
}
