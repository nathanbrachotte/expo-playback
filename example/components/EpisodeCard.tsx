import { Check, Copy, Ellipsis, Minus, Trash2 } from "@tamagui/lucide-icons"
import * as Clipboard from "expo-clipboard"
import React, { ComponentProps, useEffect, useMemo, useState } from "react"
import { useWindowDimensions } from "react-native"
import RenderHtml from "react-native-render-html"
import { Card, CardProps, Paragraph, useTheme } from "tamagui"
import { useDeleteEpisodeMetadataAndAudioFileMutation } from "../clients/local.mutations"
import { cleanHtmlText } from "../utils/text.utils"
import { formatDate, formatDuration, formatRemainingTime } from "../utils/time.utils"
import { Optional } from "../utils/types.utils"
import { PureXStack, PureYStack } from "./PureStack"

import { toggleIsFinished } from "expo-playback"
import { EntityImage } from "../types/db.types"
import { getImageFromEntities } from "../utils/image.utils"
import { PrettyMetadata } from "../utils/metadata.utils"
import { ActionSheet, ActionSheetAction } from "./ActionSheet"
import { CustomButtonIcon, GhostButton, MarkAsFinishedButton, PlayButtonsSection } from "./buttons"
import { PureImage } from "./image"
import { PureProgressBar } from "./PureProgressBar"
import { useGetEpisodePrettyMetadata } from "../hooks/useGetEpisodePrettyMetadata"

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
  return (
    <PureXStack jc="flex-start" ai="flex-start" gap="$1">
      <Component opacity={isFinished ? 0.6 : 1} {...componentProps}>
        {title}
      </Component>
    </PureXStack>
  )
}

export function CleanEpisodeDescription({
  description,
  isFinished,
}: {
  description: string
  isFinished: Optional<boolean>
}) {
  const cleanedDescription = cleanHtmlText(description)

  return (
    <PureYStack flex={1} mt="$2" opacity={isFinished ? 0.6 : 1}>
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
  prettyMetadata,
  date,
  size = "$2",
}: {
  prettyMetadata: PrettyMetadata
  date: Date | null
  size?: ComponentProps<typeof Paragraph>["size"]
}) {
  const { isFinished, duration, progress } = prettyMetadata

  return (
    <PureXStack jc="flex-start" ai="center" opacity={isFinished ? 0.6 : 1}>
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
            <Paragraph size={size}>Finished</Paragraph>
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
  const prettyMetadata = useGetEpisodePrettyMetadata(episode.id ?? 0, {
    playback: true,
    downloadProgress: false,
  })

  const { isFinished, isDownloaded } = prettyMetadata

  // TODO: Return skeleton?
  if (!episode.id) {
    console.log("episode.id is null")
    return null
  }

  return (
    <Card
      bordered
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
          <CleanEpisodeDescription description={episode.description} isFinished={isFinished} />
          {prettyMetadata ? (
            <DurationAndDateSection prettyMetadata={prettyMetadata} date={episode.publishedAt} />
          ) : null}
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
          <EpisodeCardProgress episodeId={episode.id} prettyMetadata={prettyMetadata} />

          {episode.id ? <PlayButtonsSection episodeId={episode.id} /> : null}
        </Card.Footer>
      </PureYStack>
    </Card>
  )
}

const EpisodeCardProgress = ({
  episodeId,
  prettyMetadata,
}: {
  episodeId: number | undefined
  prettyMetadata: PrettyMetadata
}) => {
  const { progressPercentage } = prettyMetadata

  // TODO: Figure out why this is needed
  const [progress, setProgress] = useState(progressPercentage)

  useEffect(() => {
    setProgress(progressPercentage)
  }, [progressPercentage])

  if (progressPercentage < 1) {
    return null
  }

  return (
    <PureXStack flex={1} px="$4" w="100%">
      <PureProgressBar value={progress} height={4} />
    </PureXStack>
  )
}
