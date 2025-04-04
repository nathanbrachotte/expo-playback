import { useRoute } from "@react-navigation/native"
import { sql } from "drizzle-orm"
import { useLiveQuery } from "drizzle-orm/expo-sqlite"
import { Image } from "react-native"
import { H4, Paragraph, ScrollView, YStack, XStack } from "tamagui"

import { useFetchEpisodesQuery } from "../clients/podcast.queries"
import { Layout } from "../components/Layout"
import { db } from "../db/client"
import { podcastsTable } from "../db/schema"
import { PodcastScreenRouteProp } from "../types/navigation"

export function PodcastScreen() {
  const route = useRoute<PodcastScreenRouteProp>()
  const { id } = route.params

  const { data: podcasts } = useLiveQuery(
    db
      .select()
      .from(podcastsTable)
      .where(sql`id = ${id}`),
  )

  const { data: episodes } = useFetchEpisodesQuery(id)
  console.log("🚀 ~ PodcastScreen ~ episodes:", episodes)

  // TODO: Replace query to just get one
  const podcast = podcasts[0]

  if (!podcast) {
    return (
      <Layout header={<H4>Podcast</H4>}>
        <Paragraph>Podcast not found</Paragraph>
      </Layout>
    )
  }

  return (
    <Layout header={<H4>Podcast</H4>}>
      <ScrollView showsVerticalScrollIndicator={false}>
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
                {podcast.author} • xx episodes
              </Paragraph>
            </YStack>
          </XStack>

          <YStack gap="$2">
            <Paragraph size="$5" fontWeight="bold">
              About
            </Paragraph>
            <Paragraph size="$4">{podcast.description}</Paragraph>
          </YStack>

          <YStack gap="$2">
            <Paragraph size="$5" fontWeight="bold">
              Details
            </Paragraph>
            <YStack gap="$1">
              <Paragraph size="$3">
                <Paragraph fontWeight="bold">Release Date:</Paragraph>{" "}
                {new Date(podcast.createdAt).toLocaleDateString()}
              </Paragraph>
              {/* <Paragraph size="$3">
                <Paragraph fontWeight="bold">Content Rating:</Paragraph> {podcast.contentAdvisoryRating}
              </Paragraph>
              <Paragraph size="$3">
                <Paragraph fontWeight="bold">Genre:</Paragraph> {podcast.primaryGenreName}
              </Paragraph>
              <Paragraph size="$3">
                <Paragraph fontWeight="bold">Episodes:</Paragraph> {podcast.trackCount}
              </Paragraph> */}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </Layout>
  )
}
