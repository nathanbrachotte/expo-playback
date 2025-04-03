import React from "react"
import { YStack, H4 } from "tamagui"

import { AllEpisodesList } from "./AllEpisodesList"

export function AllEpisodesSection() {
  return (
    <>
      <YStack>
        <H4>Episode Feed</H4>
        <AllEpisodesList />
      </YStack>
    </>
  )
}
