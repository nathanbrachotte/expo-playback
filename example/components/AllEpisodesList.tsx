import { useNavigation } from "@react-navigation/native"
import React from "react"
import { FlatList } from "react-native"
import { YStack, Paragraph } from "tamagui"

import { EpisodeCard } from "./EpisodeCard"
import { useAllEpisodesQuery } from "../clients/podcast.local.queries"

export function AllEpisodesList() {
  const navigation = useNavigation()

  const { data: episodesWithPodcasts } = useAllEpisodesQuery(1)

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
