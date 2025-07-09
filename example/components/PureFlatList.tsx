import { useNavigation } from "@react-navigation/native"
import React, { ComponentType, ReactElement } from "react"
import { FlatList, FlatListProps, RefreshControl, Platform } from "react-native"
import { Paragraph, YStack } from "tamagui"

import { ErrorSection } from "./Sections/Error"
import { LoadingSection } from "./Sections/Loading"
import { SECTION_PADDING_VALUE } from "./Sections/PureSection"
import { getEpisodeStateFromMetadata } from "../utils/metadata.utils"
import { EpisodeCard } from "./episode"
import { LocalEpisode, LocalEpisodeMetadata, LocalPodcast } from "../types/db.types"

type EpisodeWithPodcast = {
  episode: LocalEpisode
  podcast: LocalPodcast
  episodeMetadata?: LocalEpisodeMetadata | null
}

type PureFlatListProps = {
  data?: EpisodeWithPodcast[]
  error: Error | null
  isLoading: boolean
  fetchNextPage: () => void
  hasNextPage?: boolean
  isFetchingNextPage: boolean
  onEpisodePress?: (episodeId: number, podcastId: number) => void
  ListEmptyComponent?: ComponentType<any> | ReactElement | null
  ListHeaderComponent?: ComponentType<any> | ReactElement | null
  contentContainerStyle?: FlatListProps<EpisodeWithPodcast>["contentContainerStyle"]
  onRefresh?: () => void
  isRefreshing?: boolean
}

export function PureFlatList({
  data = [],
  error,
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  onEpisodePress,
  ListEmptyComponent,
  ListHeaderComponent,
  contentContainerStyle,
  onRefresh,
  isRefreshing = false,
}: PureFlatListProps) {
  const navigation = useNavigation()

  if (error) {
    return <ErrorSection />
  }

  if (isLoading) {
    return <LoadingSection />
  }

  if (data.length === 0) {
    if (ListEmptyComponent) {
      if (React.isValidElement(ListEmptyComponent)) {
        return ListEmptyComponent
      }
      const EmptyComponent = ListEmptyComponent as ComponentType
      return <EmptyComponent />
    }
    return (
      <YStack flex={1} gap="$4">
        <Paragraph>No episodes found</Paragraph>
      </YStack>
    )
  }

  const handleEpisodePress = (episodeId: number, podcastId: number) => {
    if (onEpisodePress) {
      onEpisodePress(episodeId, podcastId)
    } else {
      navigation.navigate("Episode", {
        episodeId: String(episodeId),
        podcastId: String(podcastId),
      })
    }
  }

  return (
    <FlatList
      data={data}
      onEndReachedThreshold={0.3}
      onEndReached={() => {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      }}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={Platform.OS === "ios" ? "#ffffff" : undefined}
            colors={Platform.OS === "android" ? ["#ffffff"] : undefined}
            progressBackgroundColor={Platform.OS === "android" ? "#000000" : undefined}
          />
        ) : undefined
      }
      contentContainerStyle={[
        { paddingHorizontal: SECTION_PADDING_VALUE / 2 },
        contentContainerStyle,
      ]}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        <YStack paddingVertical="$4">
          <LoadingSection />
        </YStack>
      }
      indicatorStyle="white"
      renderItem={({ item }) => {
        const prettyMetadata = item.episodeMetadata
          ? getEpisodeStateFromMetadata(item.episodeMetadata)
          : null

        return (
          <EpisodeCard
            episode={item.episode}
            podcast={item.podcast}
            prettyMetadata={prettyMetadata}
            onCardPress={() => handleEpisodePress(item.episode.id, item.podcast.id)}
          />
        )
      }}
    />
  )
}
