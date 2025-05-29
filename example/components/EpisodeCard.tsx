import { Check, CircleCheck, Ellipsis, Trash2 } from "@tamagui/lucide-icons"
import React, { useState } from "react"
import { Paragraph, Image, Card, CardProps, Progress } from "tamagui"

import { PureXStack, PureYStack } from "./PureStack"
import { CustomButtonIcon, GhostButton, PlayButton } from "./buttons"
import { Optional } from "../utils/types.utils"
import { EpisodeTitle } from "./episode"
import { ActionSheet, ActionSheetAction } from "./ActionSheet"

export function CardActionSheet({
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
  image: Optional<string>
  extraInfo?: Optional<React.ReactNode>
  smallHeader?: Optional<string>
  bigHeader: string
  onPress?: VoidFunction
  cardProps?: CardProps
  isFinished?: boolean
  isDownloaded?: boolean
  isDownloading?: boolean
  progress?: number
  isInProgress?: boolean
  episodeId?: number
  onDelete?: () => void
  onMarkAsFinished?: () => void
}

export const EpisodeCard = ({
  image,
  extraInfo,
  smallHeader,
  bigHeader,
  onPress,
  cardProps,
  isFinished,
  isDownloaded,
  isDownloading,
  progress,
  isInProgress,
  episodeId,
  onDelete,
  onMarkAsFinished,
}: EpisodeCardProps) => {
  return (
    <Card
      bordered
      animation="bouncy"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
      size="$4"
      marginVertical="$2"
      p="$2.5"
      onPress={onPress}
      gap="$3"
      flexDirection="row"
      {...cardProps}
    >
      <PureYStack flex={1}>
        <PureXStack flex={1} gap="$2">
          {image && <Image source={{ uri: image }} w="$5" h="$5" borderRadius="$2" />}
          <PureYStack flex={1}>
            {/* Podcast title, in small */}
            {smallHeader ? (
              <Paragraph size="$3" numberOfLines={1} opacity={0.8}>
                {smallHeader}
              </Paragraph>
            ) : null}
            {/* Episode title, in big */}
            <EpisodeTitle
              title={bigHeader}
              isFinished={isFinished}
              Component={Paragraph}
              componentProps={{ size: "$5", numberOfLines: 1, opacity: isFinished ? 0.6 : 1 }}
            />
          </PureYStack>
        </PureXStack>
        {extraInfo ? <PureYStack mt="$1">{extraInfo}</PureYStack> : null}
        <Card.Footer alignItems="center" justifyContent="space-between">
          <PureXStack centered gap="$2">
            {/* <GhostButton onPress={() => {}} Icon={Plus} /> */}
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
            <CardActionSheet
              episodeId={episodeId}
              isDownloaded={isDownloaded}
              onDelete={onDelete}
              onMarkAsFinished={onMarkAsFinished}
            />
          </PureXStack>
          {isInProgress ? (
            <PureXStack flex={1} px="$6" w="100%">
              <Progress value={progress} size="$1" bg="$color1">
                <Progress.Indicator animation="quick" bg="$color10" />
              </Progress>
            </PureXStack>
          ) : null}
          {episodeId ? (
            <PlayButton
              isDownloaded={isDownloaded}
              isDownloading={isDownloading}
              episodeId={episodeId}
            />
          ) : null}
        </Card.Footer>
      </PureYStack>
    </Card>
  )
}
