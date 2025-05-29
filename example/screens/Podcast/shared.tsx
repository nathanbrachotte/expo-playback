import React from "react"
import { Paragraph, H5, CardProps } from "tamagui"

import { CoverImage } from "../../components/CoverImage"
import { EpisodeCard } from "../../components/EpisodeCard"
import { PureXStack, PureYStack } from "../../components/PureStack"
import { SharedPodcastFields } from "../../types/db.types"
import { DEVICE_WIDTH } from "../../utils/constants"
import { DurationAndDateSection } from "../../components/Dates"

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
        <CoverImage entity={podcast} size={DEVICE_WIDTH * 0.3} />
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

export function PodcastScreenEpisodeCard({
  title,
  image,
  podcastTitle,
  onPress,
  rssId,
  podcastId,
  publishedAt,
  duration,
  cardProps,
  episodeId,
  ...prettyMetadata
}: {
  title: string
  image: string | null
  podcastTitle: string
  onPress?: VoidFunction
  rssId: string | null
  podcastId: number
  publishedAt: Date
  duration: number | null
  cardProps?: CardProps
  isFinished?: boolean
  isDownloaded?: boolean
  isDownloading?: boolean
  progress?: number
  isInProgress?: boolean
  episodeId?: number
}) {
  return (
    <EpisodeCard
      bigHeader={title}
      smallHeader={podcastTitle}
      image={image}
      extraInfo={<DurationAndDateSection duration={duration} date={publishedAt} />}
      onPress={onPress}
      cardProps={cardProps}
      episodeId={episodeId}
      {...prettyMetadata}
    />
  )
}
