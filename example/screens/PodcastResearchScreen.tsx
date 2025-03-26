import { useState } from "react"
import { Card, H4, Input, Paragraph, ScrollView, YStack, Button, XStack, Spinner } from "tamagui"

interface SearchResult {
  id: string
  title: string
  author: string
  description: string
}

export function PodcastResearchScreen() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      // TODO: Replace with actual API call
      // Simulating API call with mock data
      setTimeout(() => {
        setSearchResults([
          {
            id: "1",
            title: "Tech Talk Weekly",
            author: "Tech Experts",
            description: "Weekly discussions about the latest in technology",
          },
          {
            id: "2",
            title: "Code Stories",
            author: "Developer Team",
            description: "Real stories from the world of software development",
          },
        ])
        setIsSearching(false)
      }, 1000)
    } catch (error) {
      console.error("Search failed:", error)
      setIsSearching(false)
    }
  }

  const handleSavePodcast = (podcast: SearchResult) => {
    // TODO: Implement save to database functionality
    console.log("Saving podcast:", podcast)
  }

  return (
    <YStack p="$4">
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <YStack gap="$3">
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
                <XStack gap="$3" flex={1}>
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
    </YStack>
  )
}
