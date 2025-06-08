import React from "react"
import { Paragraph, H5 } from "tamagui"

import { PureXStack, PureYStack } from "../../components/PureStack"
import { SharedPodcastFields } from "../../types/db.types"
import { DEVICE_WIDTH } from "../../utils/constants"
import { getImageFromEntity } from "../../utils/image.utils"
import { PureImage } from "../../components/image"

export function AboutSection({
  podcast,
  episodeCount,
  ActionSection,
}: {
  podcast: SharedPodcastFields
  episodeCount: number
  ActionSection: React.ReactNode
}) {
  return (
    <>
      <PureXStack px="$3" gap="$3">
        <PureImage
          uri={getImageFromEntity(podcast, "600")}
          width={DEVICE_WIDTH * 0.3}
          height={DEVICE_WIDTH * 0.3}
        />
        <PureYStack flex={1} gap="$2">
          <PureYStack flex={1} jc="flex-start" ai="flex-start">
            <H5 numberOfLines={2}>{podcast.title}</H5>
            <Paragraph size="$4">Author(s): {podcast.author}</Paragraph>
            <Paragraph size="$4">Episodes: {episodeCount}</Paragraph>
          </PureYStack>
        </PureYStack>
      </PureXStack>
      <PureXStack px="$3" mt="$4">
        {ActionSection}
      </PureXStack>
    </>
  )
}
