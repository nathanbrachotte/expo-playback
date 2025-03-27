import { useState } from "react"
import { Card, H4, Input, Paragraph, ScrollView, YStack, Button, XStack, Spinner } from "tamagui"

import { Layout } from "../components/Layout"

interface SearchResult {
  id: string
  title: string
  author: string
  description: string
  artworkUrl100?: string
}

export function PodcastResearchScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)

    try {
      const encodedQuery = encodeURIComponent(searchQuery.trim())
      const response = await fetch(`https://itunes.apple.com/search?media=podcast&term=${encodedQuery}&country=DE`)

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()

      if (data && data.results) {
        const formattedResults: SearchResult[] = data.results.map((item: any) => ({
          id: item.trackId?.toString() || item.collectionId?.toString() || Math.random().toString(),
          title: item.trackName || item.collectionName || "Unknown Title",
          author: item.artistName || "Unknown Author",
          description: item.description || "No description available",
          artworkUrl100: item.artworkUrl100,
        }))

        setSearchResults(formattedResults)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error("Search failed:", error)
      setError("Failed to fetch podcasts. Please try again.")
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSavePodcast = (podcast: SearchResult) => {
    // TODO: Implement save to database functionality
    console.log("Saving podcast:", podcast)
  }

  return (
    <Layout>
      <H4>Research Podcasts</H4>

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
          onPress={handleSearch}
          disabled={isSearching}
          icon={isSearching ? () => <Spinner /> : undefined}
        >
          {isSearching ? "Searching..." : "Search"}
        </Button>
      </XStack>

      {error && (
        <Paragraph color="$red10" mt="$2">
          {error}
        </Paragraph>
      )}

      <ScrollView showsVerticalScrollIndicator={false} mt="$3">
        <YStack gap="$3">
          {searchResults.length === 0 && !isSearching && !error && (
            <Paragraph>No results found. Try a different search term.</Paragraph>
          )}
          {searchResults.map((result) => (
            <Card key={result.id} elevate size="$4" bordered>
              <Card.Header>
                <YStack gap="$2">
                  <Paragraph size="$5" fontWeight="bold">
                    {result.title}
                  </Paragraph>
                  <Paragraph size="$3">{result.author}</Paragraph>
                </YStack>
              </Card.Header>

              <Card.Footer>
                <XStack gap="$3" flex={1} p="$2">
                  <Paragraph size="$3" flex={1}>
                    {result.description}
                  </Paragraph>
                  <Button size="$3" onPress={() => handleSavePodcast(result)}>
                    Save
                  </Button>
                </XStack>
              </Card.Footer>
            </Card>
          ))}
        </YStack>
      </ScrollView>
    </Layout>
  )
}
