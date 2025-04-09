import React from "react"
import { YStack, H4, Paragraph } from "tamagui"

import { EpisodesList } from "./EpisodeList"
import { useAllEpisodesQuery } from "../clients/podcast.local.queries"
import { SharedEpisodeFields } from "../types/db"
import { Optional } from "../utils/types"

export function LocalEpisodesList() {
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
    <YStack>
      <EpisodesList
        episodes={
          episodesWithPodcasts.map(
            (episode) =>
              ({
                title: episode.episode.title,
                id: episode.episode.id,
                description: episode.episode.description,
                image: episode.episode.image,
                publishedAt: new Date(episode.episode.publishedAt),
                duration: episode.episode.duration,
                downloadUrl: episode.episode.downloadUrl,
                podcastTitle: episode.podcast.title,
                podcastId: episode.episode.podcastId,
                shouldDownload: episode.episode.shouldDownload,
              }) satisfies SharedEpisodeFields & { podcastTitle: Optional<string> },
          ) ?? []
        }
      />
    </YStack>
  )
}

export function AllEpisodesSection() {
  return (
    <>
      <YStack>
        <H4>Episode Feed</H4>
        <LocalEpisodesList />
      </YStack>
    </>
  )
}
