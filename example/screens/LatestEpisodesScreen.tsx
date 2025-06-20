import React from "react"
import { H3 } from "tamagui"

import { useInfiniteAllEpisodesQuery } from "../clients/local.queries"
import { useFetchNewEpisodesMutation } from "../clients/rss.queries"
import { PLayout } from "../components/Layout"
import { PureFlatList } from "../components/PureFlatList"

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
      console.log("🚀 ~ handleRefresh ~ fetchNewEpisodes:")
      // First fetch new episodes from RSS feeds
      await fetchNewEpisodes()
      // Then refetch local data to show the updated episodes
      await refetch()
    } catch (error) {
      console.error("Error during refresh:", error)
    }
  }

  return (
    <PLayout.Screen header={<H3>Latest episodes</H3>}>
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
    </PLayout.Screen>
  )
}
