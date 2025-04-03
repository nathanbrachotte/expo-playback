import { useNavigation } from "@react-navigation/native"
import { desc, sql } from "drizzle-orm"
import { useLiveQuery } from "drizzle-orm/expo-sqlite"
import React from "react"
import { FlatList } from "react-native"
import { YStack, Paragraph } from "tamagui"

import { EpisodeCard } from "./EpisodeCard"
import { db } from "../db/client"
import { episodesTable, podcastsTable } from "../db/schema"

export function AllEpisodesList() {
  const navigation = useNavigation()
  // Join episodes with podcasts to get podcast title, and order by published_at desc
  const { data: episodesWithPodcasts } = useLiveQuery(
    db
      .select({
        episode: {
          id: episodesTable.id,
          title: episodesTable.title,
          description: episodesTable.description,
          image: episodesTable.image,
          publishedAt: episodesTable.publishedAt,
          duration: episodesTable.duration,
          downloadUrl: episodesTable.downloadUrl,
        },
        podcast: {
          title: podcastsTable.title,
        },
      })
      .from(episodesTable)
      .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
      .orderBy(desc(episodesTable.publishedAt)),
  )

  const isLoading = !episodesWithPodcasts

  if (isLoading) {
    return <Paragraph>Loading episodes...</Paragraph>
  }

  if (!episodesWithPodcasts || episodesWithPodcasts.length === 0) {
    return (
      <YStack flex={1} gap="$4">
        <Paragraph>No episodes found</Paragraph>
      </YStack>
    )
  }

  return (
    <YStack>
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
            onPress={() => navigation.navigate("Episode", { id: item.episode.id.toString() })}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </YStack>
  )
}
