import { Headphones, Plus, X } from "@tamagui/lucide-icons"
import { useState } from "react"
import { H4, Input, Paragraph, YStack, Button, XStack, Spinner, H3 } from "tamagui"

import { useSearchItunesPodcastsQuery } from "../clients/itunes.queries"
import { useSavePodcastMutation } from "../clients/local.mutations"
import { PureLayout } from "../components/Layout"
import { PodcastCard } from "../components/PodcastCard"
import { PureScrollView } from "../components/PureScrollview"
import { PureYStack } from "../components/PureStack"
import { getImageFromEntity } from "../utils/image.utils"

export function PodcastSearchScreen() {
  const [searchQuery, setSearchQuery] = useState("Floodcast")

  const { data: searchResults, error, isLoading, refetch, isFetching } = useSearchItunesPodcastsQuery(searchQuery)
  const { mutateAsync: savePodcast, isPending: isSaving } = useSavePodcastMutation()

  const isSearching = isFetching || isLoading
  const data = searchResults?.results || []
  const hasSearchResults = data.length > 0

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
      {error ? (
        <PureYStack centered flex={1}>
          <H3>Oh no 😵</H3>
          <Paragraph mt="$2">Failed to fetch podcasts. Please try again.</Paragraph>
        </PureYStack>
      ) : null}

      <PureScrollView scrollViewProps={{ alwaysBounceVertical: true, mt: "$3" }}>
        <YStack gap="$3">
          {!hasSearchResults && !isLoading && !error && (
            <PureYStack flex={1} centered py="$10" gap="$4">
              <Headphones size={64} color="$blue10" />
              <YStack alignItems="center" gap="$2">
                <H3>No Podcasts Yet!</H3>
                <Paragraph size="$4" textAlign="center">
                  Start by searching for your favorite podcasts above 👆
                </Paragraph>
              </YStack>
            </PureYStack>
          )}
          {hasSearchResults &&
            data.map((result) => {
              if (!result) {
                return null
              }
              if (!("appleId" in result)) {
                console.warn(
                  "🚀 ~ PodcastSearchScreen ~ data.map ~ Wrong shape result:",
                  JSON.stringify(result, null, 2),
                )
                return null
              }

              return (
                <PodcastCard
                  key={result.appleId}
                  id={result.appleId.toString()}
                  title={result.title}
                  author={result.author}
                  cover={getImageFromEntity(result, "100")}
                  Actions={
                    <PureYStack centered>
                      <Button
                        circular
                        icon={isSaving ? () => <Spinner /> : () => <Plus size={16} />}
                        onPress={() => savePodcast({ podcast: result })}
                        disabled={isSaving}
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
