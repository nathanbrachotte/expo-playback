import { Check, CircleCheck, Download, Ellipsis, Play, Trash2 } from "@tamagui/lucide-icons"
import React from "react"
import { YStack, Paragraph, Image, XStack, Card, CardProps, Spinner, Progress } from "tamagui"

import { PureXStack, PureYStack } from "./PureStack"
import { GhostButton } from "./buttons"
import { Optional } from "../utils/types.utils"

export type EpisodeCardProps = {
  title: string
  subtitle?: Optional<string>
  image: Optional<string>
  extraInfo?: Optional<string>
  podcastTitle?: Optional<string>
  onPress?: VoidFunction
  cardProps?: CardProps
}

type IconProps = {
  color?: string
  size?: string | number
  strokeWidth?: number | string
}

const CustomIcon = ({ Component, color }: { Component: React.ComponentType<IconProps>; color?: string }) => {
  return <Component size="$1" strokeWidth={2.5} color={color} />
}

export function PlayButton({ isDownloaded, isDownloading }: { isDownloaded: boolean; isDownloading: boolean }) {
  if (isDownloaded) {
    return (
      <PureXStack w="$3" h="$3" centered themeInverse>
        <GhostButton onPress={() => {}} Icon={<CustomIcon Component={Play} />} />
      </PureXStack>
    )
  }

  if (isDownloading) {
    return (
      <PureXStack w="$3" h="$3" centered>
        <Spinner size="small" />
      </PureXStack>
    )
  }

  return (
    <PureXStack centered w="$3" h="$3">
      <GhostButton onPress={() => {}} Icon={<CustomIcon Component={Download} />} />
    </PureXStack>
  )
}

export const EpisodeCard = ({
  title,
  subtitle,
  image,
  extraInfo,
  podcastTitle,
  onPress,
  cardProps,
}: EpisodeCardProps) => {
  const isPlayed = Math.random() > 0.5
  const isDownloaded = Math.random() > 0.5
  const isDownloading = !isDownloaded && Math.random() > 0.5
  const progress = isPlayed ? 100 : Math.random() * 100
  const isInProgress = progress > 0 && progress < 95

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
            <Paragraph size="$3" numberOfLines={1} opacity={0.8}>
              {podcastTitle}
            </Paragraph>
            {/* Episode title, in big */}
            <PureXStack jc="flex-start" gap="$1" ai="center">
              {isPlayed ? <Check size="$1" color="$green9" /> : null}
              <Paragraph size="$5" numberOfLines={1} opacity={isPlayed ? 0.6 : 1}>
                {title}
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
              {" - "}
            </Paragraph>
            {isPlayed ? (
              <PureXStack centered gap="$1">
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
                isPlayed ? <CustomIcon Component={Check} color="$green9" /> : <CustomIcon Component={CircleCheck} />
              }
            />
            {isDownloaded ? (
              <GhostButton onPress={() => {}} Icon={<CustomIcon Component={Trash2} color="$red10" />} />
            ) : null}
            <GhostButton onPress={() => {}} Icon={<CustomIcon Component={Ellipsis} />} />
          </PureXStack>
          {isInProgress ? (
            <PureXStack flex={1} px="$6" w="100%">
              <Progress value={progress} size="$1" bg="$color1">
                <Progress.Indicator animation="quick" bg="$color10" />
              </Progress>
            </PureXStack>
          ) : null}
          <PlayButton isDownloaded={isDownloaded} isDownloading={isDownloading} />
        </Card.Footer>
      </PureYStack>
    </Card>
  )
}
