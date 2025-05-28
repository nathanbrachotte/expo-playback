import { Check, CircleCheck, Ellipsis, Trash2 } from "@tamagui/lucide-icons"
import React from "react"
import { YStack, Paragraph, Image, XStack, Card, CardProps, Progress } from "tamagui"

import { PureXStack, PureYStack } from "./PureStack"
import { CustomButtonIcon, GhostButton, PlayButton } from "./buttons"
import { Optional } from "../utils/types.utils"

export type EpisodeCardProps = {
  subtitle?: Optional<string>
  image: Optional<string>
  extraInfo?: Optional<string>
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
}

export const EpisodeCard = ({
  subtitle,
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
            <PureXStack jc="flex-start" gap="$1" ai="center">
              {isFinished ? <Check size="$1" color="$green9" /> : null}
              <Paragraph size="$5" numberOfLines={1} opacity={isFinished ? 0.6 : 1}>
                {bigHeader}
              </Paragraph>
            </PureXStack>
          </PureYStack>
        </PureXStack>
        {subtitle ? (
          <YStack flex={1} mt="$2">
            <Paragraph numberOfLines={2} size="$1" lineHeight={16}>
              {subtitle}
            </Paragraph>
          </YStack>
        ) : null}
        {extraInfo ? (
          <XStack>
            <Paragraph fontSize="$1" opacity={0.5}>
              {extraInfo}
            </Paragraph>
            {isFinished ? (
              <PureXStack centered gap="$1">
                <Paragraph fontSize="$1" opacity={1}>
                  {" - "}
                </Paragraph>
                <Paragraph fontSize="$1" opacity={1} color="white" fontWeight="bold">
                  Finished
                </Paragraph>
              </PureXStack>
            ) : null}
          </XStack>
        ) : null}
        <Card.Footer mt="$2" alignItems="center" justifyContent="space-between">
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
              <GhostButton onPress={() => {}} Icon={<CustomButtonIcon Component={Trash2} color="$red10" />} />
            ) : null}
            <GhostButton onPress={() => {}} Icon={<CustomButtonIcon Component={Ellipsis} />} />
          </PureXStack>
          {isInProgress ? (
            <PureXStack flex={1} px="$6" w="100%">
              <Progress value={progress} size="$1" bg="$color1">
                <Progress.Indicator animation="quick" bg="$color10" />
              </Progress>
            </PureXStack>
          ) : null}
          {episodeId ? (
            <PlayButton isDownloaded={isDownloaded} isDownloading={isDownloading} episodeId={episodeId} />
          ) : null}
        </Card.Footer>
      </PureYStack>
    </Card>
  )
}
