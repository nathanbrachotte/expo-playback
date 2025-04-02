import { Headphones, Plus } from "@tamagui/lucide-icons"
import { useToastController } from "@tamagui/toast"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { H4, Input, Paragraph, ScrollView, YStack, Button, XStack, Spinner } from "tamagui"

import { searchPodcasts } from "../clients/podcast"
import { useSavePodcast } from "../clients/podcast.mutations"
import { Layout } from "../components/Layout"
import { PodcastCard } from "../components/PodcastCard"
import { PodcastSearchResult, SearchResult } from "../types/podcast"

export function PodcastSearchScreen() {
  const [searchQuery, setSearchQuery] = useState("Floodcast")

  const {
    data: searchResults,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["podcastSearch", searchQuery],
    queryFn: () => searchPodcasts(searchQuery),
    enabled: searchQuery.trim().length > 0,
    select: (data) => {
      if (!data?.results) return []
      return data.results.map((item: PodcastSearchResult) => ({
        ...item,
        // id: item.trackId?.toString() || item.collectionId?.toString() || Math.random().toString(),
        // title: item.trackName || item.collectionName || "Unknown Title",
        // author: item.artistName || "Unknown Author",
        // artworkUrl100: item.artworkUrl100,
      }))
    },
  })

  const savePodcast = useSavePodcast()
  const toastController = useToastController()

  const handleSavePodcast = async (podcast: PodcastSearchResult) => {
    try {
      const res = await savePodcast.mutateAsync(podcast)

      toastController.show("Podcast Added!", {
        message: `${res.lastInsertRowId} has been added to your library.`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Failed to save podcast:", error)
      toastController.show("Failed to Save", {
        message: "There was an error saving the podcast. Please try again.",
        duration: 3000,
      })
    }
  }

  const isSearching = isFetching || isLoading

  return (
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
          onPress={() => refetch()}
          disabled={isSearching}
          icon={isSearching ? () => <Spinner /> : undefined}
        >
          {isSearching ? "" : "Search"}
        </Button>
      </XStack>
      {error && (
        <Paragraph color="$red10" marginTop="$2">
          Failed to fetch podcasts. Please try again.
        </Paragraph>
      )}

      <ScrollView showsVerticalScrollIndicator={false} alwaysBounceVertical={false}>
        <YStack gap="$3" mt="$3" p="$1" bg="$red1">
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
          {searchResults?.map((result) => (
            <PodcastCard
              key={result.trackId}
              id={result.trackId.toString()}
              title={result.trackName}
              author={result.artistName}
              cover={result.artworkUrl100}
              Actions={
                <Button
                  size="$3"
                  circular
                  icon={isLoading ? () => <Spinner /> : () => <Plus size={16} />}
                  onPress={() => handleSavePodcast(result)}
                  disabled={isLoading}
                />
              }
            />
          ))}
        </YStack>
      </ScrollView>
    </Layout>
  )
}
