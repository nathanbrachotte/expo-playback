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
  const { id, episode } = route.params

  const { data: episodes } = useLiveQuery(
    db
      .select()
      .from(episodesTable)
      .where(sql`id = ${id}`),
  )

  // !FIXME: Only get one
  const finalEpisode = episode || episodes[0]

  return (
    <Layout header={<H4>Episode</H4>}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$4" p="$4">
          <XStack gap="$4" alignItems="center">
            {finalEpisode.image ? (
              <Image
                source={{ uri: finalEpisode.image }}
                style={{ width: 120, height: 120, borderRadius: 12 }}
                resizeMode="cover"
              />
            ) : null}
            <YStack gap="$2" flex={1}>
              <Paragraph size="$8" fontWeight="bold">
                {finalEpisode.title}
              </Paragraph>
              <Paragraph size="$5">{finalEpisode.description}</Paragraph>
            </YStack>
          </XStack>

          <YStack gap="$2">
            <Paragraph size="$3">
              <Paragraph fontWeight="bold">Release Date:</Paragraph>{" "}
              {new Date(finalEpisode.publishedAt).toLocaleDateString()}
            </Paragraph>
          </YStack>
        </YStack>
      </ScrollView>
    </Layout>
  )
}
