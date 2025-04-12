import React from "react"
import { YStack, Paragraph } from "tamagui"

import { EpisodesList } from "./EpisodeList"
import { useAllEpisodesQuery } from "../clients/local.queries"

export function AllEpisodesList() {
  const { data: episodesWithPodcasts } = useAllEpisodesQuery()

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
    <EpisodesList
      episodes={
        episodesWithPodcasts.map((episode) => ({
          ...episode.episode,
          podcastTitle: episode.podcast.title,
        })) ?? []
      }
    />
  )
}
