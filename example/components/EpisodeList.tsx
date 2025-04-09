import { useNavigation } from "@react-navigation/native"
import React from "react"
import { FlatList } from "react-native"

import { EpisodeCard } from "./EpisodeCard"
import { SharedEpisodeFields } from "../types/db"
import { Optional } from "../utils/types"

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const month = date.toLocaleString("default", { month: "short" })
  const day = date.getDate()
  const year = date.getFullYear()

  return `${month} ${day}, ${year}`
}

export function EpisodesList({
  episodes,
}: {
  episodes: (SharedEpisodeFields & { podcastTitle?: Optional<string> })[]
}) {
  const navigation = useNavigation()

  return (
    <FlatList
      data={episodes}
      keyExtractor={(item) => item.podcastId.toString()}
      renderItem={({ item }) => (
        <EpisodeCard
          title={item.title}
          subtitle={item.description}
          image={item.image}
          extraInfo={`${formatDate(Number(item.publishedAt))} • ${formatDuration(item.duration)}`}
          podcastTitle={item.podcastTitle}
          onPress={() => navigation.navigate("Episode", { id: item.podcastId.toString(), episode: item })}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  )
}
