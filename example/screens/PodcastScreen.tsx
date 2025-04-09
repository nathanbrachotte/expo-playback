import { useRoute } from "@react-navigation/native"
import { sql } from "drizzle-orm"
import { useLiveQuery } from "drizzle-orm/expo-sqlite"
import { Image } from "react-native"
import { H4, Paragraph, YStack, XStack } from "tamagui"

import { useFetchEpisodesQuery, useFetchPodcastQuery } from "../clients/itunes.queries"
import { EpisodesList } from "../components/EpisodeList"
import { Layout } from "../components/Layout"
import { db } from "../db/client"
import { podcastsTable } from "../db/schema"
import { PodcastScreenRouteProp } from "../types/navigation"

export function PodcastScreen() {
  const route = useRoute<PodcastScreenRouteProp>()
  const { id } = route.params

  const { data: localPodcasts } = useLiveQuery(
    db
      .select()
      .from(podcastsTable)
      .where(sql`id = ${id}`),
  )

  const { data: fetchedPodcast, error: fetchedPodcastError } = useFetchPodcastQuery(id)

  // TODO: Replace query to just get one
  const podcast = localPodcasts[0] || fetchedPodcast

  const { data: fetchedEpisodesResponse, error: fetchedEpisodesError } = useFetchEpisodesQuery(
    podcast?.appleId.toString() || null,
  )
  const episodes = fetchedEpisodesResponse?.results

  if (!podcast) {
    return (
      <Layout header={<H4>Podcast</H4>}>
        <Paragraph>Podcast not found</Paragraph>
      </Layout>
    )
  }

  return (
    <Layout header={<H4>Podcast</H4>}>
      <YStack gap="$4" p="$4">
        <XStack gap="$4" alignItems="center">
          {podcast.image ? (
            <Image
              source={{ uri: podcast.image }}
              style={{ width: 120, height: 120, borderRadius: 12 }}
              resizeMode="cover"
            />
          ) : null}
          <YStack gap="$2" flex={1}>
            <Paragraph size="$8" fontWeight="bold">
              {podcast.title}
            </Paragraph>
            <Paragraph size="$5">{podcast.author}</Paragraph>
            <Paragraph size="$3" color="$gray11">
              {podcast.author} • TODO episodes
            </Paragraph>
          </YStack>
        </XStack>

        {podcast.description ? (
          <YStack gap="$2">
            <Paragraph size="$5" fontWeight="bold">
              About
            </Paragraph>
            <Paragraph size="$4">{podcast.description}</Paragraph>
          </YStack>
        ) : null}
        <EpisodesList episodes={episodes || []} />
      </YStack>
    </Layout>
  )
}
