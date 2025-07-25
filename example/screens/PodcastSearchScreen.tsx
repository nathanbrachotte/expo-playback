import { Headphones, Plus, X } from "@tamagui/lucide-icons"
import { useState } from "react"
import { H4, Input, Paragraph, YStack, Button, XStack, Spinner, H3 } from "tamagui"
import { useDebounceValue } from "usehooks-ts"
import { FlatList } from "react-native"

import { useSearchItunesPodcastsQuery } from "../clients/itunes.queries"
import { useRemovePodcastMutation, useSavePodcastMutation } from "../clients/local.mutations"
import { PLayout } from "../components/Layout"
import { PodcastCard } from "../components/PodcastCard"
import { PureYStack } from "../components/PureStack"
import { getImageFromEntity } from "../utils/image.utils"
import { useGetLocalPodcastQuery } from "../clients/local.queries"
import { PureButton } from "../components/buttons"

const getRandomLetters = () => {
  const letters = "abcdefghijklmnopqrstuvwxyz"
  let result = ""
  for (let i = 0; i < 3; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length))
  }
  return result
}

export function PodcastSearchScreen() {
  const [searchQuery, setSearchQuery] = useState(getRandomLetters())
  const [debouncedSearchQuery] = useDebounceValue(searchQuery, 500)

  const {
    data: searchResults,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useSearchItunesPodcastsQuery(debouncedSearchQuery)

  const isSearching = isFetching || isLoading
  const data = searchResults?.results || []
  const hasSearchResults = data.length > 0

  const renderEmptyState = () => {
    if (isLoading || error || hasSearchResults) return null
    return (
      <PureYStack flex={1} centered py="$10" gap="$4">
        <Headphones size={64} color="$blue10" />
        <YStack alignItems="center" gap="$2">
          <H3>No Podcasts Yet!</H3>
          <Paragraph size="$4" textAlign="center">
            Start by searching for your favorite podcasts above 👆
          </Paragraph>
        </YStack>
      </PureYStack>
    )
  }

  const renderItem = ({ item }: { item: (typeof data)[0] }) => {
    return <SearchResultCard key={item.appleId} entry={item} />
  }

  return (
    <PLayout.Screen header={<H4>Add Podcasts</H4>}>
      <XStack gap="$3" px="$2" mt="$2">
        <YStack flex={1} position="relative">
          <Input
            size="$5"
            placeholder="Search for podcasts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            placeholderTextColor="$gray11"
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
      <Button onPress={() => setSearchQuery("Fest & Flauschig")}>Set Fest & Flauschig</Button>

      {error ? (
        <PureYStack centered flex={1}>
          <H3>Oh no 😵</H3>
          <Paragraph mt="$2">Failed to fetch podcasts. Please try again.</Paragraph>
        </PureYStack>
      ) : (
        <FlatList
          indicatorStyle="white"
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.appleId.toString()}
          contentContainerStyle={{ flexGrow: 1, paddingTop: 12 }}
          ListEmptyComponent={renderEmptyState}
          ItemSeparatorComponent={() => <YStack height={12} />}
          showsVerticalScrollIndicator={false}
          initialNumToRender={15}
          bounces
        />
      )}
    </PLayout.Screen>
  )
}

function SearchResultCard({
  entry,
}: {
  entry: {
    appleId: number
    author: string
    title: string
    image30: string | null
    image60: string | null
    image100: string | null
    image600: string | null
    description: string
    rssFeedUrl: string | null
  }
}) {
  const { mutateAsync: savePodcast, isPending: isSaving } = useSavePodcastMutation({
    // Makes the mutation unique per card so we can have one loading state per card
    podcastId: entry.appleId.toString() || entry.title || entry.author,
  })

  const { data: localPodcast } = useGetLocalPodcastQuery(entry.appleId.toString())
  const { mutateAsync: deletePodcast, isPending: isDeleting } = useRemovePodcastMutation()

  if (!("appleId" in entry)) {
    console.warn(
      "🚀 ~ PodcastSearchScreen ~ data.map ~ Wrong shape result:",
      JSON.stringify(entry, null, 2),
    )
    return null
  }

  return (
    <PodcastCard
      key={entry.appleId}
      id={entry.appleId.toString()}
      title={entry.title}
      author={entry.author}
      cover={getImageFromEntity(entry, "100")}
      Actions={
        <PureYStack centered>
          {!localPodcast ? (
            <PureButton
              circular
              icon={isSaving ? () => <Spinner /> : () => <Plus size={16} />}
              onPress={() => savePodcast({ podcast: { ...entry, isFollowed: false } })}
              disabled={isSaving}
            />
          ) : null}
          {localPodcast ? (
            <PureButton
              circular
              variant="destructive"
              icon={() => <X size={16} />}
              onPress={() => deletePodcast(entry.appleId.toString())}
              disabled={isDeleting}
            />
          ) : null}
        </PureYStack>
      }
    />
  )
}
