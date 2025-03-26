import { useLiveQuery } from "drizzle-orm/expo-sqlite"
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator"
import React, { useState } from "react"
import { Button, Input, ScrollView, YStack, XStack, Text, Card } from "tamagui"

import { db, schema } from "../db/client"
import migrations from "../drizzle/migrations"

interface iTunesPodcast {
  collectionId: number
  collectionName: string
  artistName: string
  description: string
  artworkUrl600: string
  feedUrl: string
}

// https://itunes.apple.com/search?media=podcast&term=fest%20und%20flauschig&country=DE
export function DatabaseExplorerScreen() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<iTunesPodcast[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const { data: podcasts } = useLiveQuery(db.select().from(schema.podcasts))
  const { data: episodes } = useLiveQuery(db.select().from(schema.episodes))
  const { data: episodeMetadata } = useLiveQuery(db.select().from(schema.episodeMetadata))

  const { success, error } = useMigrations(db, migrations)

  const searchPodcasts = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://itunes.apple.com/search?media=podcast&term=${encodeURIComponent(searchTerm)}&country=DE`,
      )
      const data = await response.json()
      setSearchResults(data.results)
    } catch (error) {
      console.error("Error searching podcasts:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const addPodcastFromSearch = async (podcast: iTunesPodcast) => {
    await db.insert(schema.podcasts).values({
      title: podcast.collectionName,
      description: podcast.description || "No description available",
      image: podcast.artworkUrl600,
    } satisfies typeof schema.podcasts.$inferInsert)
  }

  const addMockPodcast = async () => {
    await db.insert(schema.podcasts).values({
      title: "Test Podcast " + Math.random().toString(36).substring(7),
      description: "This is a test podcast description",
      image: "https://example.com/test-image.jpg",
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies typeof schema.podcasts.$inferInsert)
  }

  const addMockEpisode = async () => {
    if (!podcasts?.length) {
      console.log("No podcasts available to link episode to")
      return
    }
    const randomPodcast = podcasts[Math.floor(Math.random() * podcasts.length)]

    await db.insert(schema.episodes).values({
      id: Math.floor(Math.random() * 1000000), // Random ID since it's not auto-increment
      podcastId: randomPodcast.id,
      title: "Test Episode " + Math.random().toString(36).substring(7),
      description: "This is a test episode description",
      image: "https://example.com/test-episode-image.jpg",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      duration: Math.floor(Math.random() * 3600), // Random duration up to 1 hour
      downloadUrl: "https://example.com/test-audio.mp3",
    } satisfies typeof schema.episodes.$inferInsert)
  }

  const addMockEpisodeMetadata = async () => {
    if (!episodes?.length) {
      console.log("No episodes available to add metadata to")
      return
    }
    const randomEpisode = episodes[Math.floor(Math.random() * episodes.length)]

    await db.insert(schema.episodeMetadata).values({
      episodeId: randomEpisode.id,
      playback: Math.floor(Math.random() * 100),
      isFinished: Math.random() > 0.5,
      downloadProgress: Math.floor(Math.random() * 100),
      fileSize: Math.floor(Math.random() * 10000000), // Random file size up to 10MB
    })
  }

  if (error) {
    return (
      <YStack p="$4">
        <Text color="$red10">Migration error: {error.message}</Text>
      </YStack>
    )
  }
  if (!success) {
    return (
      <YStack p="$4">
        <Text>Migration is in progress...</Text>
      </YStack>
    )
  }

  return (
    <ScrollView>
      <YStack p="$4" gap="$4">
        <Text fontSize="$7" fontWeight="bold">
          Database Explorer
        </Text>

        <XStack gap="$3">
          <Input
            flex={1}
            placeholder="Search podcasts..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={searchPodcasts}
          />
          <Button onPress={searchPodcasts} disabled={isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </XStack>

        {searchResults.length > 0 && (
          <YStack gap="$3">
            <Text fontSize="$6" fontWeight="bold">
              Search Results
            </Text>
            {searchResults.map((podcast) => (
              <Card key={podcast.collectionId} p="$4" gap="$2">
                <Text fontSize="$5" fontWeight="bold">
                  {podcast.collectionName}
                </Text>
                <Text fontSize="$4" color="$color">
                  {podcast.artistName}
                </Text>
                <Button onPress={() => addPodcastFromSearch(podcast)}>Add to Database</Button>
              </Card>
            ))}
          </YStack>
        )}

        <YStack gap="$4">
          <Card p="$4" gap="$3">
            <Text fontSize="$6" fontWeight="bold">
              Podcasts
            </Text>
            <Button onPress={addMockPodcast}>Add Mock Podcast</Button>
            <Text fontSize="$2">{JSON.stringify(podcasts, null, 2)}</Text>
          </Card>

          <Card p="$4" gap="$3">
            <Text fontSize="$6" fontWeight="bold">
              Episodes
            </Text>
            <Button onPress={addMockEpisode}>Add Mock Episode</Button>
            <Text fontSize="$2">{JSON.stringify(episodes, null, 2)}</Text>
          </Card>

          <Card p="$4" gap="$3">
            <Text fontSize="$6" fontWeight="bold">
              Episode Metadata
            </Text>
            <Button onPress={addMockEpisodeMetadata}>Add Mock Metadata</Button>
            <Text fontSize="$2">{JSON.stringify(episodeMetadata, null, 2)}</Text>
          </Card>
        </YStack>
      </YStack>
    </ScrollView>
  )
}

// https://itunes.apple.com/search?media=podcast&term=fest%20und%20flauschig&country=DE
