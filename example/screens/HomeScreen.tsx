import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { desc, sql } from "drizzle-orm"
import { useLiveQuery } from "drizzle-orm/expo-sqlite"
import { useState } from "react"
import { FlatList, Image, StyleSheet, Pressable, View } from "react-native"
import { Button, H1, YStack, Text, XStack, Card } from "tamagui"

import { Layout } from "../components/Layout"
import { Player } from "../components/Player"
import { db } from "../db/client"
import { episodes, podcasts } from "../db/schema"
import { RootStackParamList } from "../types/navigation"

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">

// Helper function to format duration in seconds to minutes and seconds
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// Helper function to format date to MMM d, yyyy (e.g. Jan 1, 2024)
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const month = date.toLocaleString("default", { month: "short" })
  const day = date.getDate()
  const year = date.getFullYear()
  return `${month} ${day}, ${year}`
}

type EpisodeInfo = {
  id: number
  title: string
  description: string
  image: string | null
  publishedAt: number
  duration: number
  downloadUrl?: string
}

type PodcastInfo = {
  title: string
}

const EpisodeCard = ({
  episode,
  podcastTitle,
  onPress,
}: {
  episode: EpisodeInfo
  podcastTitle: string
  onPress: () => void
}) => {
  return (
    <Pressable onPress={onPress}>
      <Card size="$4" bordered marginVertical="$2" p="$4">
        <XStack gap="$3">
          {episode.image && (
            <Image source={{ uri: episode.image }} style={{ width: 70, height: 70, borderRadius: 4 }} />
          )}
          <YStack flex={1}>
            <Text numberOfLines={1} fontWeight="bold">
              {episode.title}
            </Text>
            <Text numberOfLines={1} opacity={0.7}>
              {podcastTitle}
            </Text>
            <Text numberOfLines={2} opacity={0.6} fontSize="$1">
              {episode.description}
            </Text>
            <XStack mt="$2">
              <Text fontSize="$1" opacity={0.5}>
                {formatDate(episode.publishedAt)} • {formatDuration(episode.duration)}
              </Text>
            </XStack>
          </YStack>
        </XStack>
      </Card>
    </Pressable>
  )
}

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>()
  const [selectedEpisode, setSelectedEpisode] = useState<{ episode: EpisodeInfo; podcast: PodcastInfo } | null>(null)

  // Join episodes with podcasts to get podcast title, and order by published_at desc
  const { data: episodesWithPodcasts } = useLiveQuery(
    db
      .select({
        episode: {
          id: episodes.id,
          title: episodes.title,
          description: episodes.description,
          image: episodes.image,
          publishedAt: episodes.publishedAt,
          duration: episodes.duration,
          downloadUrl: episodes.downloadUrl,
        },
        podcast: {
          title: podcasts.title,
        },
      })
      .from(episodes)
      .innerJoin(podcasts, sql`${episodes.podcastId} = ${podcasts.id}`)
      .orderBy(desc(episodes.publishedAt)),
  )

  const isLoading = !episodesWithPodcasts

  const handleEpisodePress = (item: any) => {
    setSelectedEpisode({
      episode: {
        ...item.episode,
        publishedAt: Number(item.episode.publishedAt),
      },
      podcast: item.podcast,
    })
  }

  return (
    <Layout>
      <H1>Purecast</H1>
      <YStack gap="$2" height={60}>
        <XStack gap="$2">
          <Button size="$3" flex={1} onPress={() => navigation.navigate("PodcastResearch")}>
            Search Podcasts
          </Button>
          <Button size="$3" flex={1} onPress={() => navigation.navigate("DatabaseExplorer")}>
            Database Explorer
          </Button>
        </XStack>
      </YStack>

      <Text fontWeight="bold" fontSize="$5" mt="$2">
        Recent Episodes
      </Text>

      <View style={{ flex: 1 }}>
        {isLoading ? (
          <Text>Loading episodes...</Text>
        ) : !episodesWithPodcasts || episodesWithPodcasts.length === 0 ? (
          <YStack flex={1} style={styles.centered} gap="$4">
            <Text>No episodes found</Text>
            <Button size="$4" onPress={() => navigation.navigate("PodcastResearch")}>
              Add Podcasts
            </Button>
          </YStack>
        ) : (
          <FlatList
            data={episodesWithPodcasts}
            keyExtractor={(item) => item.episode.id.toString()}
            renderItem={({ item }) => (
              <EpisodeCard
                episode={{
                  ...item.episode,
                  publishedAt: Number(item.episode.publishedAt),
                }}
                podcastTitle={item.podcast.title}
                onPress={() => handleEpisodePress(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <Player />
    </Layout>
  )
}

const styles = StyleSheet.create({
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  playerContainer: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 8,
  },
})
