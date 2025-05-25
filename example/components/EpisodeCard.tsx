import { Check, CircleCheck, Download, Play } from "@tamagui/lucide-icons"
import React from "react"
import { YStack, Paragraph, Image, XStack, Card, CardProps, Spinner } from "tamagui"

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

const CustomIcon = ({
  Component,
  color,
}: {
  Component: React.ComponentType<IconProps> // The actual icon component (e.g. CircleCheck)
  color?: string // Optional color prop for the icon
}) => {
  return <Component size="$1" strokeWidth={2.5} color={color} />
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
  const isDownloading = Math.random() > 0.5

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
            <Paragraph size="$3" numberOfLines={1} opacity={0.5}>
              {podcastTitle}
            </Paragraph>
            {/* Episode title, in big */}
            <Paragraph
              size="$5"
              //
              numberOfLines={1}
            >
              {title}
            </Paragraph>
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
                <Check size="$1" color="$green9" />
              </PureXStack>
            ) : null}
          </XStack>
        ) : null}
        <Card.Footer mt="$2" alignItems="center" justifyContent="space-between">
          <PureXStack centered>
            {/* <GhostButton onPress={() => {}} Icon={Plus} /> */}
            <GhostButton
              onPress={() => {}}
              Icon={
                isPlayed ? <CustomIcon Component={Check} color="$green9" /> : <CustomIcon Component={CircleCheck} />
              }
            />
            <PureXStack centered>
              <GhostButton
                showBg
                onPress={() => {}}
                Icon={
                  isDownloaded ? (
                    <CustomIcon Component={Download} color="$green9" />
                  ) : isDownloading ? (
                    <Spinner size="small" />
                  ) : (
                    <CustomIcon Component={Download} />
                  )
                }
              />
            </PureXStack>
          </PureXStack>
          <PureXStack themeInverse>
            <GhostButton onPress={() => {}} Icon={Play} bg="$color1" />
          </PureXStack>
        </Card.Footer>
      </PureYStack>
    </Card>
  )
}
