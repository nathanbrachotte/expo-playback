import { useRoute } from "@react-navigation/native"
import { sql } from "drizzle-orm"
import { useLiveQuery } from "drizzle-orm/expo-sqlite"
import { Image } from "react-native"
import { H4, Paragraph, ScrollView, YStack, XStack } from "tamagui"

import { Layout } from "../components/Layout"
import { db } from "../db/client"
import { episodesTable } from "../db/schema"
import { EpisodeScreenRouteProp } from "../types/navigation"

export function EpisodeScreen() {
  const route = useRoute<EpisodeScreenRouteProp>()
  const { id } = route.params

  const { data: episodes } = useLiveQuery(
    db
      .select()
      .from(episodesTable)
      .where(sql`id = ${id}`),
  )

  if (!episodes || episodes.length === 0) {
    return (
      <Layout header={<H4>Episode</H4>}>
        <Paragraph>Episode not found</Paragraph>
      </Layout>
    )
  }
  // !FIXME: Only get one
  const episode = episodes[0]

  return (
    <Layout header={<H4>Episode</H4>}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$4" p="$4">
          <XStack gap="$4" alignItems="center">
            {episode.image ? (
              <Image
                source={{ uri: episode.image }}
                style={{ width: 120, height: 120, borderRadius: 12 }}
                resizeMode="cover"
              />
            ) : null}
            <YStack gap="$2" flex={1}>
              <Paragraph size="$8" fontWeight="bold">
                {episode.title}
              </Paragraph>
              <Paragraph size="$5">{episode.description}</Paragraph>
              <Paragraph size="$3" color="$gray11">
                • xx episodes
              </Paragraph>
            </YStack>
          </XStack>

          <YStack gap="$2">
            <Paragraph size="$5" fontWeight="bold">
              About
            </Paragraph>
            <Paragraph size="$4">{episode.description}</Paragraph>
          </YStack>

          <YStack gap="$2">
            <Paragraph size="$5" fontWeight="bold">
              Details
            </Paragraph>
            <YStack gap="$1">
              <Paragraph size="$3">
                <Paragraph fontWeight="bold">Release Date:</Paragraph>{" "}
                {new Date(episode.createdAt).toLocaleDateString()}
              </Paragraph>
              {/* <Paragraph size="$3">
                <Paragraph fontWeight="bold">Content Rating:</Paragraph> {episode.contentAdvisoryRating}
              </Paragraph>
              <Paragraph size="$3">
                <Paragraph fontWeight="bold">Genre:</Paragraph> {episode.primaryGenreName}
              </Paragraph>
              <Paragraph size="$3">
                <Paragraph fontWeight="bold">Episodes:</Paragraph> {episode.trackCount}
              </Paragraph> */}
            </YStack>
          </YStack>
        </YStack>
      </ScrollView>
    </Layout>
  )
}
