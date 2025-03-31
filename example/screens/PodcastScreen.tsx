import { useNavigation, RouteProp, useRoute } from "@react-navigation/native"
import { useEffect, useState } from "react"
import { Image } from "react-native"
import { H4, Paragraph, ScrollView, YStack, XStack, Button, Spinner } from "tamagui"

import { Layout } from "../components/Layout"
import { RootStackParamList } from "../types/navigation"

interface PodcastDetails {
  title: string
  author: string
  description: string
  artworkUrl100?: string
  artworkUrl600?: string
  feedUrl: string
  primaryGenreName: string
  trackCount: number
  releaseDate: string
  contentAdvisoryRating: "Clean" | "Explicit"
}

type PodcastScreenRouteProp = RouteProp<RootStackParamList, "Podcast">

export function PodcastScreen() {
  const route = useRoute<PodcastScreenRouteProp>()
  const { id } = route.params

  const [podcast, setPodcast] = useState<PodcastDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPodcastDetails() {
      try {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${id}&country=DE`)
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (data && data.results && data.results[0]) {
          const podcastData = data.results[0]
          setPodcast({
            title: podcastData.trackName || podcastData.collectionName,
            author: podcastData.artistName,
            description: podcastData.description || "No description available",
            artworkUrl100: podcastData.artworkUrl100,
            artworkUrl600: podcastData.artworkUrl600,
            feedUrl: podcastData.feedUrl,
            primaryGenreName: podcastData.primaryGenreName,
            trackCount: podcastData.trackCount,
            releaseDate: podcastData.releaseDate,
            contentAdvisoryRating: podcastData.contentAdvisoryRating,
          })
        } else {
          throw new Error("Podcast not found")
        }
      } catch (error) {
        console.error("Failed to fetch podcast details:", error)
        setError("Failed to load podcast details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPodcastDetails()
  }, [id])

  if (isLoading) {
    return (
      <Layout header={<H4>Podcast Details</H4>}>
        <YStack flex={1} alignItems="center" justifyContent="center">
          <Spinner size="large" />
        </YStack>
      </Layout>
    )
  }

  if (error || !podcast) {
    return (
      <Layout header={<H4>Podcast Details</H4>}>
        <YStack flex={1} alignItems="center" justifyContent="center" p="$4">
          <Paragraph color="$red10" textAlign="center">
            {error || "Podcast not found"}
          </Paragraph>
        </YStack>
      </Layout>
    )
  }

  return (
    <Layout header={<H4>Podcast Details</H4>}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$4" p="$4">
          <XStack gap="$4" alignItems="center">
            {podcast.artworkUrl600 && (
              <Image
                source={{ uri: podcast.artworkUrl600 }}
                style={{ width: 120, height: 120, borderRadius: 12 }}
                resizeMode="cover"
              />
            )}
            <YStack gap="$2" flex={1}>
              <Paragraph size="$8" fontWeight="bold">
                {podcast.title}
              </Paragraph>
              <Paragraph size="$5">{podcast.author}</Paragraph>
              <Paragraph size="$3" color="$gray11">
                {podcast.primaryGenreName} • {podcast.trackCount} episodes
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
                {new Date(podcast.releaseDate).toLocaleDateString()}
              </Paragraph>
              <Paragraph size="$3">
                <Paragraph fontWeight="bold">Content Rating:</Paragraph> {podcast.contentAdvisoryRating}
              </Paragraph>
              <Paragraph size="$3">
                <Paragraph fontWeight="bold">Genre:</Paragraph> {podcast.primaryGenreName}
              </Paragraph>
              <Paragraph size="$3">
                <Paragraph fontWeight="bold">Episodes:</Paragraph> {podcast.trackCount}
              </Paragraph>
            </YStack>
          </YStack>

          <Button size="$5" mt="$2">
            Subscribe
          </Button>
        </YStack>
      </ScrollView>
    </Layout>
  )
}
