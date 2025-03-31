import { Headphones } from "@tamagui/lucide-icons"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { H4, Input, Paragraph, ScrollView, YStack, Button, XStack, Spinner } from "tamagui"
import { Toast, ToastProvider } from "@tamagui/toast"

import { Layout } from "../components/Layout"
import { PodcastCard } from "../components/PodcastCard"
import { searchPodcasts } from "../clients/podcast"
import { useSavePodcast } from "../clients/podcast.mutations"
import { SearchResult, PodcastSearchResult } from "../types/podcast"

export function PodcastSearchScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const {
    data: searchResults,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["podcastSearch", searchQuery],
    queryFn: () => searchPodcasts(searchQuery),
    enabled: searchQuery.trim().length > 0,
    select: (data) => {
      if (!data?.results) return []
      return data.results.map((item: PodcastSearchResult) => ({
        id: item.trackId?.toString() || item.collectionId?.toString() || Math.random().toString(),
        title: item.trackName || item.collectionName || "Unknown Title",
        author: item.artistName || "Unknown Author",
        description: "Tap to view podcast details",
        artworkUrl100: item.artworkUrl100,
      }))
    },
  })

  const savePodcast = useSavePodcast()

  const handleSavePodcast = async (podcast: SearchResult) => {
    try {
      await savePodcast.mutateAsync(podcast)
      setToastMessage("Podcast saved successfully!")
      setShowToast(true)
    } catch (error) {
      console.error("Failed to save podcast:", error)
      setToastMessage("Failed to save podcast. Please try again.")
      setShowToast(true)
    }
  }

  return (
    <ToastProvider>
      <Layout header={<H4>Add Podcasts</H4>}>
        <XStack gap="$3">
          <Input
            flex={1}
            size="$4"
            placeholder="Search for podcasts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          <Button
            size="$4"
            onPress={() => setIsSearching(true)}
            disabled={isLoading}
            icon={isLoading ? () => <Spinner /> : undefined}
          >
            {isLoading ? "" : "Search"}
          </Button>
        </XStack>
        {error && (
          <Paragraph color="$red10" mt="$2">
            Failed to fetch podcasts. Please try again.
          </Paragraph>
        )}

        <ScrollView showsVerticalScrollIndicator={false} mt="$3" alwaysBounceVertical={false}>
          <YStack gap="$3">
            {(!searchResults || searchResults.length === 0) && !isLoading && !error && (
              <YStack flex={1} alignItems="center" justifyContent="center" py="$10" gap="$4">
                <Headphones size={64} color="$blue10" />
                <YStack alignItems="center" gap="$2">
                  <Paragraph size="$6" fontWeight="bold" textAlign="center">
                    No Podcasts Yet!
                  </Paragraph>
                  <Paragraph size="$4" textAlign="center">
                    Start by searching for your favorite podcasts above 👆
                  </Paragraph>
                </YStack>
              </YStack>
            )}
            {searchResults?.map((result: SearchResult) => (
              <PodcastCard
                key={result.id}
                id={result.id}
                title={result.title}
                author={result.author}
                description={result.description}
                artworkUrl100={result.artworkUrl100}
                onSave={() => handleSavePodcast(result)}
                isSaving={savePodcast.isPending}
              />
            ))}
          </YStack>
        </ScrollView>

        {showToast && (
          <Toast open={showToast} onOpenChange={setShowToast} duration={3000} animation="quick">
            <Toast.Title>{toastMessage}</Toast.Title>
          </Toast>
        )}
      </Layout>
    </ToastProvider>
  )
}
