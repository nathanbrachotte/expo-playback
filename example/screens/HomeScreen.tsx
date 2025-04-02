import { useNavigation } from "@react-navigation/native"
import { Search } from "@tamagui/lucide-icons"
import { useToastController } from "@tamagui/toast"
import { useLiveQuery } from "drizzle-orm/expo-sqlite"
import React from "react"
import { Button, Text, XStack, H2, H4, YStack, H3, ScrollView } from "tamagui"

import { PurecastLogo } from "../assets/PurecastLogo"
import { AllEpisodesList } from "../components/AllEpisodesList"
import { Layout } from "../components/Layout"
import { PodcastCard } from "../components/PodcastCard"
import { db } from "../db/client"
import { podcasts } from "../db/schema"
import { HomeScreenNavigationProp } from "../types/navigation"

function PodcastsList() {
  const { data: podcastList } = useLiveQuery(db.select().from(podcasts))

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
  const { data: podcastList } = useLiveQuery(db.select().from(podcasts))

  return (
    <YStack p="$2">
      <H3 mb="$2">All my podcasts</H3>
      {podcastList?.length ? <PodcastsList /> : <Text>No podcasts found</Text>}
    </YStack>
  )
}

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>()

  const toastController = useToastController()

  const showToast = () => {
    toastController.show("Hey", {})
  }

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
          <Button onPress={showToast}>Show toast</Button>
          <Button icon={<Search />} size="$3" onPress={() => navigation.navigate("PodcastSearch")} />
        </XStack>
      }
    >
      <Button size="$3" onPress={() => navigation.navigate("DatabaseExplorer")}>
        Database Explorer
      </Button>
      <PodcastsSection />
      <AllEpisodesList />
      <Button onPress={showToast}>Show toast</Button>
      {/* <Player /> */}
    </Layout>
  )
}
