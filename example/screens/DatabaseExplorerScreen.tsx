import { useLiveQuery } from "drizzle-orm/expo-sqlite"
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator"
import * as ExpoPlayback from "expo-playback"
import React from "react"
import { Button, YStack, XStack, Text, Card, ScrollView, H4 } from "tamagui"

import { PureLayout } from "../components/Layout"
import { db, schema } from "../db/client"
import { TableName } from "../db/schema"
import { useNativeSaveLiveQuery } from "../db/useNativeSaveLiveQuery"
import migrations from "../drizzle/migrations"

const tableNames: TableName[] = ["episode_metadata"]

export function DatabaseExplorerScreen() {
  const { data: podcasts } = useLiveQuery(db.select().from(schema.podcastsTable))
  const { data: episodes } = useLiveQuery(db.select().from(schema.episodesTable))
  const { data: episodeMetadata } = useNativeSaveLiveQuery(db.select().from(schema.episodeMetadatasTable), tableNames)

  const { success, error } = useMigrations(db, migrations)

  const addMockPodcast = async () => {
    await db.insert(schema.podcastsTable).values({
      title: "Test Podcast " + Math.random().toString(36).substring(7),
      description: "This is a test podcast description",
      image30: "https://example.com/test-image.jpg",
      appleId: Math.floor(Math.random() * 1000000),
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies typeof schema.podcastsTable.$inferInsert)
  }

  const addMockEpisode = async () => {
    if (!podcasts?.length) {
      console.log("No podcasts available to link episode to")
      return
    }
    const randomPodcast = podcasts[Math.floor(Math.random() * podcasts.length)]

    await db.insert(schema.episodesTable).values({
      id: Math.floor(Math.random() * 1000000), // Random ID since it's not auto-increment
      podcastId: randomPodcast.id,
      title: "Test Episode " + Math.random().toString(36).substring(7),
      description: "This is a test episode description",
      image30: "https://example.com/test-episode-image.jpg",
      publishedAt: new Date(),
      createdAt: new Date(),
      shouldDownload: true,
      updatedAt: new Date(),
      duration: Math.floor(Math.random() * 3600), // Random duration up to 1 hour
      downloadUrl: "https://file-examples.com/storage/fe6c3da4a667eaec4b5b466/2017/11/file_example_MP3_2MG.mp3",
    } satisfies typeof schema.episodesTable.$inferInsert)
  }

  const addMockEpisodeMetadata = async () => {
    if (!episodes?.length) {
      console.log("No episodes available to add metadata to")
      return
    }
    const randomEpisode = episodes[Math.floor(Math.random() * episodes.length)]

    await db.insert(schema.episodeMetadatasTable).values({
      episodeId: randomEpisode.id,
      playback: Math.floor(Math.random() * 100),
      isFinished: Math.random() > 0.5,
      downloadProgress: Math.floor(Math.random() * 100),
      fileSize: Math.floor(Math.random() * 10000000), // Random file size up to 10MB
    })
  }

  const resetDatabase = async () => {
    try {
      // Delete all data from tables in reverse order of dependencies
      await db.delete(schema.episodeMetadatasTable)
      await db.delete(schema.episodesTable)
      await db.delete(schema.podcastsTable)
    } catch (error) {
      console.error("Error resetting database:", error)
    }
  }

  if (error) {
    return (
      <PureLayout>
        <YStack p="$4">
          <Text color="$red10">Migration error: {error.message}</Text>
        </YStack>
      </PureLayout>
    )
  }
  if (!success) {
    return (
      <PureLayout>
        <YStack p="$4">
          <Text>Migration is in progress...</Text>
        </YStack>
      </PureLayout>
    )
  }

  return (
    <PureLayout header={<H4 fontWeight="bold">Database Explorer</H4>}>
      <YStack p="$4" gap="$4">
        <XStack gap="$2">
          <Button onPress={resetDatabase} theme="red">
            Reset Database
          </Button>
        </XStack>
        <YStack gap="$3">
          <Button onPress={addMockPodcast}>Add Mock Podcast</Button>
          <Button onPress={addMockEpisode}>Add Mock Episode</Button>
          <Button onPress={addMockEpisodeMetadata}>Add Mock Metadata</Button>
        </YStack>

        <ScrollView>
          <YStack gap="$4">
            <Card p="$4" gap="$3">
              <Text fontSize="$6" fontWeight="bold">
                Podcasts
              </Text>
              <Text fontSize="$4">{JSON.stringify(podcasts, null, 2)}</Text>
            </Card>

            <Card p="$4" gap="$3">
              <Text fontSize="$6" fontWeight="bold">
                Episodes (first 10)
              </Text>
              <Text fontSize="$4">{JSON.stringify(episodes.slice(0, 10), null, 2)}</Text>
            </Card>

            <Card p="$4" gap="$3">
              <Text fontSize="$6" fontWeight="bold">
                Episode Metadata
              </Text>
              <Text fontSize="$4">{JSON.stringify(episodeMetadata, null, 2)}</Text>
            </Card>
          </YStack>
        </ScrollView>
      </YStack>
    </PureLayout>
  )
}
