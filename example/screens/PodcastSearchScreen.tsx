import { Headphones, Plus } from "@tamagui/lucide-icons"
import { useState } from "react"
import { H4, Input, Paragraph, ScrollView, YStack, Button, XStack, Spinner } from "tamagui"

import { useSearchItunesPodcastsQuery } from "../clients/itunes.queries"
import { useSavePodcastMutation } from "../clients/local.mutations"
import { PureLayout } from "../components/Layout"
import { PodcastCard } from "../components/PodcastCard"
import { PureYStack } from "../components/PureStack"

export function PodcastSearchScreen() {
  const [searchQuery, setSearchQuery] = useState("Floodcast")

  const { data: searchResults, error, isLoading, refetch, isFetching } = useSearchItunesPodcastsQuery(searchQuery)
  const { handleSavePodcast } = useSavePodcastMutation()

  console.log("🚀 ~ PodcastSearchScreen ~ searchResults:", JSON.stringify(searchResults, null, 2))

  const isSearching = isFetching || isLoading

  return (
    <PureLayout header={<H4>Add Podcasts</H4>}>
      <XStack gap="$3" px="$2" mt="$2">
        <Input
          flex={1}
          size="$5"
          placeholder="Search for podcasts..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
        />
        <Button
          size="$5"
          onPress={() => refetch()}
          disabled={isSearching}
          icon={isSearching ? () => <Spinner /> : undefined}
        >
          {isSearching ? "" : "Search"}
        </Button>
      </XStack>
      {error ? <Paragraph marginTop="$2">Failed to fetch podcasts. Please try again.</Paragraph> : null}

      <ScrollView showsVerticalScrollIndicator={false} alwaysBounceVertical={false}>
        <YStack gap="$3" mt="$3" p="$1">
          {(!searchResults || searchResults.resultCount === 0) && !isLoading && !error && (
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
          {searchResults?.results?.map((result) => {
            return (
              <PodcastCard
                key={result.appleId}
                id={result.appleId.toString()}
                title={result.title}
                author={result.author}
                cover={result.image}
                Actions={
                  <PureYStack centered>
                    <Button
                      circular
                      icon={isLoading ? () => <Spinner /> : () => <Plus size={16} />}
                      onPress={() => handleSavePodcast(result.appleId.toString())}
                      disabled={isLoading}
                    />
                  </PureYStack>
                }
              />
            )
          })}
        </YStack>
      </ScrollView>
    </PureLayout>
  )
}
