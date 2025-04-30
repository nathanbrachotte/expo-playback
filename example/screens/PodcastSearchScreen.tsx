import { Headphones, Plus, X } from "@tamagui/lucide-icons"
import { useState } from "react"
import { H4, Input, Paragraph, YStack, Button, XStack, Spinner } from "tamagui"

import { useSearchItunesPodcastsQuery } from "../clients/itunes.queries"
import { useSavePodcastMutation } from "../clients/local.mutations"
import { PureLayout } from "../components/Layout"
import { PodcastCard } from "../components/PodcastCard"
import { PureScrollView } from "../components/PureScrollview"
import { PureYStack } from "../components/PureStack"

export function PodcastSearchScreen() {
  const [searchQuery, setSearchQuery] = useState("Floodcast")

  const { data: searchResults, error, isLoading, refetch, isFetching } = useSearchItunesPodcastsQuery(searchQuery)
  const { handleSavePodcast } = useSavePodcastMutation()

  const isSearching = isFetching || isLoading
  const data = searchResults?.results
  const hasSearchResults = data && data.length > 0

  return (
    <PureLayout header={<H4>Add Podcasts</H4>}>
      <XStack gap="$3" px="$2" mt="$2">
        <YStack flex={1} position="relative">
          <Input
            size="$5"
            placeholder="Search for podcasts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery ? (
            <Button
              size="$2"
              circular
              position="absolute"
              right="$2"
              top="$3"
              onPress={() => setSearchQuery("")}
              icon={() => <X size={14} />}
            />
          ) : null}
        </YStack>
        <Button
          size="$5"
          onPress={() => refetch()}
          disabled={isSearching}
          icon={isSearching ? () => <Spinner /> : undefined}
          minWidth={100}
        >
          {isSearching ? "" : "Search"}
        </Button>
      </XStack>
      {error ? <Paragraph marginTop="$2">Failed to fetch podcasts. Please try again.</Paragraph> : null}

      <PureScrollView>
        <YStack gap="$3" mt="$3">
          {!hasSearchResults && !isLoading && !error && (
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
          {hasSearchResults &&
            data.map((result) => {
              if (!result) {
                return null
              }

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
      </PureScrollView>
    </PureLayout>
  )
}
