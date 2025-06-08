import { Check, CheckCircle2 } from "@tamagui/lucide-icons"
import React, { ComponentProps, useState } from "react"
import { getVariable, Paragraph, useTheme } from "tamagui"
import { formatDate, formatDuration, formatRemainingTime } from "../utils/time.utils"
import { PureXStack, PureYStack } from "./PureStack"
import { Optional } from "../utils/types.utils"
import RenderHtml from "react-native-render-html"
import { useWindowDimensions } from "react-native"
import { cleanHtmlText } from "../utils/text.utils"
import { CircleCheck, Ellipsis, Trash2, Copy } from "@tamagui/lucide-icons"
import { Card, CardProps, Progress } from "tamagui"
import * as Clipboard from "expo-clipboard"

import { CustomButtonIcon, GhostButton, PlayButton } from "./buttons"
import { ActionSheet, ActionSheetAction } from "./ActionSheet"
import { PureImage } from "./image"
import { getImageFromEntities } from "../utils/image.utils"
import { EntityImage } from "../types/db.types"
import { PrettyMetadata } from "../utils/metadata.utils"

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
      {isFinished ? <Check size={checkSize} color="$green9" mt="$1.5" /> : null}
      <Component opacity={isFinished ? 0.6 : 1} {...componentProps}>
        {title}
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
  duration,
  date,
  isFinished,
  progress,
  size = "$2",
}: {
  duration: number | null
  date: Date | null
  isFinished?: Optional<boolean>
  progress?: Optional<number>
  size?: ComponentProps<typeof Paragraph>["size"]
}) {
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
      {duration && progress ? (
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

export function EpisodeCardActionSheet({
  episodeId,
  isDownloaded,
  onDelete,
  onMarkAsFinished,
}: {
  episodeId?: number
  isDownloaded?: boolean
  onDelete?: () => void
  onMarkAsFinished?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const actions: ActionSheetAction[] = [
    {
      label: "Mark as finished",
      onPress: () => onMarkAsFinished?.(),
      Icon: Check,
    },
  ]

  if (__DEV__ && episodeId) {
    actions.push({
      label: "Copy episode ID",
      onPress: async () => {
        await Clipboard.setStringAsync(episodeId.toString())
      },
      Icon: Copy,
    })
  }

  if (isDownloaded) {
    actions.push({
      label: "Delete download",
      onPress: () => onDelete?.(),
      isDestructive: true,
      Icon: <Trash2 color="$red10" />,
    })
  }

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
  animated?: boolean
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
  prettyMetadata?: Optional<PrettyMetadata>
  onCardPress?: () => void
  cardProps?: CardProps
}

export const NewEpisodeCard = ({
  animated = true,
  episode,
  podcast,
  prettyMetadata,
  onCardPress,
  cardProps,
}: EpisodeCardProps) => {
  const image = getImageFromEntities(episode, podcast)
  const { isFinished, isDownloaded, isDownloading, progress, isInProgress } = prettyMetadata || {}

  return (
    <Card
      bordered
      animation="bouncy"
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
          {image && <PureImage uri={image} width="$5" height="$5" />}
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
            duration={episode.duration}
            date={episode.publishedAt}
            isFinished={isFinished}
            progress={progress}
          />
        </PureYStack>
        <Card.Footer alignItems="center" justifyContent="space-between">
          <PureXStack centered gap="$2">
            <GhostButton
              onPress={() => {}}
              Icon={
                isFinished ? (
                  <CustomButtonIcon Component={Check} color="$green9" />
                ) : (
                  <CustomButtonIcon Component={CircleCheck} />
                )
              }
            />
            {isDownloaded ? (
              <GhostButton
                onPress={() => {}}
                Icon={<CustomButtonIcon Component={Trash2} color="$red10" />}
              />
            ) : null}
            {/* Menu */}
            <EpisodeCardActionSheet
              episodeId={episode.id}
              isDownloaded={isDownloaded}
              onDelete={() => {}}
              onMarkAsFinished={() => {}}
            />
          </PureXStack>
          {isInProgress ? (
            <PureXStack flex={1} px="$6" w="100%">
              <Progress value={progress} size="$1" bg="$color1">
                <Progress.Indicator animation="quick" bg="$color10" />
              </Progress>
            </PureXStack>
          ) : null}
          {episode.id ? (
            <PlayButton
              isDownloaded={isDownloaded}
              isDownloading={isDownloading}
              episodeId={episode.id}
            />
          ) : null}
        </Card.Footer>
      </PureYStack>
    </Card>
  )
}
