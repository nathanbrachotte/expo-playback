import React from "react"
import { H3 } from "tamagui"

import { useInfiniteAllEpisodesQuery } from "../clients/local.queries"
import { PLayout } from "../components/Layout"
import { PureFlatList } from "../components/PureFlatList"

export function LatestEpisodesScreen() {
  const { data, error, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteAllEpisodesQuery()

  return (
    <PLayout.Screen header={<H3>Latest episodes</H3>}>
      <PureFlatList
        data={data?.pages.flat()}
        error={error}
        isLoading={isLoading}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />
    </PLayout.Screen>
  )
}
