import { Check, CheckCircle2, Minus } from "@tamagui/lucide-icons"
import React, { ComponentProps, useEffect, useMemo, useState } from "react"
import { getVariable, Paragraph, useTheme } from "tamagui"
import { formatDate, formatDuration, formatRemainingTime } from "../utils/time.utils"
import { PureXStack, PureYStack } from "./PureStack"
import { Optional } from "../utils/types.utils"
import RenderHtml from "react-native-render-html"
import { useWindowDimensions } from "react-native"
import { cleanHtmlText } from "../utils/text.utils"
import { Ellipsis, Trash2, Copy } from "@tamagui/lucide-icons"
import { Card, CardProps } from "tamagui"
import * as Clipboard from "expo-clipboard"
import { useDeleteEpisodeMetadataAndAudioFileMutation } from "../clients/local.mutations"

import { CustomButtonIcon, GhostButton, MarkAsFinishedButton, PlayButtonsSection } from "./buttons"
import { ActionSheet, ActionSheetAction } from "./ActionSheet"
import { PureImage } from "./image"
import { getImageFromEntities } from "../utils/image.utils"
import { EntityImage } from "../types/db.types"
import {
  getEpisodeStateFromMetadata,
  getProgressPercentageFromMetadata,
  PrettyMetadata,
} from "../utils/metadata.utils"
import { useGetLiveLocalEpisodeMetadataQuery } from "../clients/local.queries"
import { toggleIsFinished } from "expo-playback"
import { PureProgressBar } from "./PureProgressBar"

type BaseTitleProps = {
  children: React.ReactNode
  size?: ComponentProps<typeof Paragraph>["size"]
  numberOfLines?: ComponentProps<typeof Paragraph>["numberOfLines"]
  opacity?: ComponentProps<typeof Paragraph>["opacity"]
}

export function EpisodeCardTitle({
  title,
  isFinished,
  Component = Paragraph,
  componentProps = {},
}: {
  title: string
  isFinished: Optional<boolean>
  Component: React.ComponentType<BaseTitleProps>
  componentProps?: ComponentProps<typeof Paragraph>
}) {
  const value = getVariable(componentProps.size)
  const checkSize = value ? value * 0.3 : getVariable("$1")

  return (
    <PureXStack jc="flex-start" ai="flex-start" gap="$1">
      {isFinished ? <Check size={checkSize} color="$green9" mt={6} /> : null}
      <Component opacity={isFinished ? 0.6 : 1} {...componentProps}>
        {title}
      </Component>
    </PureXStack>
  )
}

export function CleanEpisodeDescription({ description }: { description: string }) {
  const cleanedDescription = cleanHtmlText(description)

  return (
    <PureYStack flex={1} mt="$2">
      <Paragraph numberOfLines={2} size="$1" lineHeight={16}>
        {cleanedDescription}
      </Paragraph>
    </PureYStack>
  )
}

export function EpisodeDescriptionHtml({ description }: { description: string }) {
  const { width } = useWindowDimensions()
  const theme = useTheme()

  const source = {
    html: `
      <body style="
        color: ${theme.color.val};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 1.5;
      ">
        ${description}
      </body>
    `,
  }

  return <RenderHtml contentWidth={width} source={source} />
}

export function DurationAndDateSection({
  episodeId,
  date,
  fallbackDuration,
  size = "$2",
}: {
  episodeId: number
  date: Date | null
  fallbackDuration: number | null
  size?: ComponentProps<typeof Paragraph>["size"]
}) {
  const { data: metadata } = useGetLiveLocalEpisodeMetadataQuery(episodeId, {
    playback: true,
    downloadProgress: false,
  })

  const {
    isFinished,
    duration: metadataDuration,
    progress,
  } = getEpisodeStateFromMetadata(metadata?.episodeMetadata)

  const duration = metadataDuration || fallbackDuration

  return (
    <PureXStack jc="flex-start" ai="center">
      <Paragraph size={size}>{date ? formatDate(date) : ""}</Paragraph>
      <Paragraph size={size}>
        {duration ? (
          <>
            <Paragraph size={size}>{" • "}</Paragraph>
            {formatDuration(duration)}
          </>
        ) : null}
      </Paragraph>
      {isFinished ? (
        <PureXStack centered gap="$1">
          <Paragraph size={size}>{" • "}</Paragraph>
          <PureXStack centered gap="$1.5">
            <Paragraph fontWeight="bold">Finished</Paragraph>
            <CheckCircle2 size={16} color="$green9" />
          </PureXStack>
        </PureXStack>
      ) : null}
      {duration && progress && !isFinished ? (
        <PureXStack centered gap="$1">
          <Paragraph size={size}>{" • "}</Paragraph>
          <Paragraph fontWeight="bold" size={size}>
            {formatRemainingTime(progress, duration)}
          </Paragraph>
        </PureXStack>
      ) : null}
    </PureXStack>
  )
}

export function EpisodeActionSheet({
  episodeId,
  isDownloaded,
  isFinished,
}: {
  episodeId?: number
  isDownloaded?: boolean
  isFinished?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const deleteMetadataMutation = useDeleteEpisodeMetadataAndAudioFileMutation()

  const deleteMetadataAndAudioFile = () => {
    if (episodeId) {
      deleteMetadataMutation.mutate(episodeId)
    }
  }

  const actions = useMemo<ActionSheetAction[]>(() => {
    const newActions: ActionSheetAction[] = [
      {
        label: isFinished ? "Mark as unfinished" : "Mark as finished",
        onPress: () => {
          if (episodeId) {
            toggleIsFinished(episodeId)
          }
        },
        Icon: Check,
      },
      {
        label: "Forget episode",
        onPress: deleteMetadataAndAudioFile,
        Icon: Minus,
      },
    ]

    if (__DEV__ && episodeId) {
      newActions.push({
        label: "Copy episode ID",
        onPress: async () => {
          await Clipboard.setStringAsync(episodeId.toString())
        },
        Icon: Copy,
      })
    }

    if (isDownloaded) {
      newActions.push({
        label: "Delete download",
        onPress: deleteMetadataAndAudioFile,
        isDestructive: true,
        Icon: Trash2,
      })
    }

    return newActions
  }, [deleteMetadataAndAudioFile, episodeId, isDownloaded, isFinished])

  return (
    <>
      <GhostButton
        onPress={() => setIsOpen(true)}
        Icon={<CustomButtonIcon Component={Ellipsis} />}
      />
      <ActionSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        actions={actions}
        cancelAction={{
          label: "Cancel",
          onPress: () => {},
        }}
      />
    </>
  )
}

export type EpisodeCardProps = {
  episode: {
    id?: number
    title: string
    description: string
    duration: number | null
    publishedAt: Date
  } & EntityImage
  podcast?: {
    id: number
    title: string
  } & EntityImage
  initialPrettyMetadata?: Optional<PrettyMetadata>
  onCardPress?: VoidFunction
  cardProps?: CardProps
  imageProps?: {
    lazy?: boolean
    priority?: "low" | "normal" | "high"
  }
}

export const EpisodeCard = ({
  episode,
  podcast,
  initialPrettyMetadata,
  onCardPress,
  cardProps,
  imageProps,
}: EpisodeCardProps) => {
  const image = getImageFromEntities(episode, podcast)
  const { data: metadata } = useGetLiveLocalEpisodeMetadataQuery(episode.id ?? 0)

  const [prettyMetadata, setPrettyMetadata] = useState(initialPrettyMetadata)

  useEffect(() => {
    if (metadata == null) {
      setPrettyMetadata(undefined)
      return
    }
    setPrettyMetadata(getEpisodeStateFromMetadata(metadata?.episodeMetadata))
  }, [metadata])

  const { isFinished, isDownloaded, isInProgress, progressPercentage } = prettyMetadata || {}

  if (episode.id === 1752861201491) {
    console.log("prettyMetadata", prettyMetadata, metadata)
  }

  return (
    <Card
      bordered
      hoverStyle={{ scale: 0.95 }}
      pressStyle={{ scale: 0.95 }}
      size="$4"
      marginVertical="$2"
      p="$2.5"
      onPress={onCardPress}
      gap="$3"
      flexDirection="row"
      {...cardProps}
    >
      <PureYStack flex={1}>
        <PureXStack flex={1} gap="$2">
          {image ? (
            <PureImage uri={image} width="$5" height="$5" priority={imageProps?.priority} />
          ) : null}
          <PureYStack flex={1}>
            {/* Podcast title, in small */}
            {podcast?.title ? (
              <Paragraph size="$3" numberOfLines={1} opacity={0.8}>
                {podcast.title}
              </Paragraph>
            ) : null}
            {/* Episode title, in big */}
            <EpisodeCardTitle
              title={episode.title}
              isFinished={isFinished}
              Component={Paragraph}
              componentProps={{ size: "$5", numberOfLines: 1, opacity: isFinished ? 0.6 : 1 }}
            />
          </PureYStack>
        </PureXStack>
        <PureYStack gap="$1.5">
          <CleanEpisodeDescription description={episode.description} />
          <DurationAndDateSection
            episodeId={episode.id ?? 0}
            fallbackDuration={episode.duration}
            date={episode.publishedAt}
          />
        </PureYStack>
        <Card.Footer alignItems="center" justifyContent="space-between">
          <PureXStack centered gap="$2">
            {episode.id ? <MarkAsFinishedButton episodeId={episode.id} /> : null}
            {/* Menu */}
            <EpisodeActionSheet
              episodeId={episode.id}
              isDownloaded={isDownloaded}
              isFinished={isFinished}
            />
          </PureXStack>
          <EpisodeCardProgress episodeId={episode.id} initialProgress={progressPercentage} />

          {episode.id ? <PlayButtonsSection episodeId={episode.id} /> : null}
        </Card.Footer>
      </PureYStack>
    </Card>
  )
}

const EpisodeCardProgress = ({
  episodeId,
  initialProgress = 0,
}: {
  episodeId: number | undefined
  initialProgress?: number
}) => {
  const [progress, setProgress] = useState(initialProgress)

  const { data: metadata } = useGetLiveLocalEpisodeMetadataQuery(episodeId ?? 0, {
    playback: true,
    downloadProgress: false,
  })

  useEffect(() => {
    if (metadata) {
      setProgress(getProgressPercentageFromMetadata(metadata.episodeMetadata))
    } else {
      setProgress(0)
    }
  }, [metadata])

  if (progress < 1) {
    return null
  }

  return (
    <PureXStack flex={1} px="$4" w="100%">
      <PureProgressBar value={progress} height={4} />
    </PureXStack>
  )
}
