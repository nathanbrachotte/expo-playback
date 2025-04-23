import React from "react"
import { H1, Paragraph, YStack } from "tamagui"

import { useGetLiveLocalEpisodeQuery } from "../clients/local.queries"

const SHOW_TEST_SECTION = false
export function TestSection() {
  const { data: localEpisode, error, updatedAt } = useGetLiveLocalEpisodeQuery({ id: "1000704249323" })

  if (!SHOW_TEST_SECTION) {
    return null
  }

  return (
    <YStack bg="$red5">
      <H1>Test section</H1>
      <Paragraph>Amount result: {JSON.stringify(localEpisode.length, null, 2)}</Paragraph>
      <Paragraph>{JSON.stringify(localEpisode, null, 2)}</Paragraph>
      <Paragraph>{JSON.stringify(error, null, 2)}</Paragraph>
    </YStack>
  )
}
