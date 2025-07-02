import React from "react"
import { H3 } from "tamagui"

import { useInfiniteAllEpisodesQuery } from "../clients/local.queries"
import { useFetchNewEpisodesMutation } from "../clients/rss.queries"
import { PLayout } from "../components/Layout"
import { PureFlatList } from "../components/PureFlatList"
import { EmptySection } from "../components/Sections/Empty"

export function LatestEpisodesScreen() {
  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteAllEpisodesQuery()

  const { mutateAsync: fetchNewEpisodes, isPending: isFetchingNewEpisodes } =
    useFetchNewEpisodesMutation()

  const handleRefresh = async () => {
    try {
      // First fetch new episodes from RSS feeds
      await fetchNewEpisodes()
      // Then refetch local data to show the updated episodes
      await refetch()
    } catch (error) {
      console.error("Error during refresh:", error)
    }
  }

  const hasData = (data?.pages.flat().length ?? -1) > 0

  return (
    <PLayout.Screen header={<H3>Latest episodes</H3>}>
      {hasData ? (
        <PureFlatList
          data={data?.pages.flat()}
          error={error}
          isLoading={isLoading}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onRefresh={handleRefresh}
          isRefreshing={isFetchingNewEpisodes || isRefetching}
        />
      ) : (
        <EmptySection />
      )}
    </PLayout.Screen>
  )
}
