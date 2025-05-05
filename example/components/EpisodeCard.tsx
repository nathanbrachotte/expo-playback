import React from "react"
import { YStack, Paragraph, Image, XStack, Card, H5, CardProps } from "tamagui"

import { Optional } from "../utils/types.utils"

export type EpisodeCardProps = {
  title: string
  subtitle: Optional<string>
  image: Optional<string>
  extraInfo: Optional<string>
  podcastTitle: Optional<string>
  onPress?: VoidFunction
  cardProps?: CardProps
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
  return (
    <Card
      bordered
      animation="bouncy"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
      size="$4"
      marginVertical="$2"
      p="$2"
      onPress={onPress}
      gap="$3"
      flexDirection="row"
      {...cardProps}
    >
      {image && <Image source={{ uri: image }} style={{ width: 70, height: 70, borderRadius: 4 }} />}
      <YStack flex={1}>
        {podcastTitle ? (
          <Paragraph size="$4" numberOfLines={1}>
            {podcastTitle}
          </Paragraph>
        ) : null}
        <H5 numberOfLines={1}>{title}</H5>
        {subtitle ? (
          <Paragraph numberOfLines={2} opacity={0.9} size="$1">
            {subtitle}
          </Paragraph>
        ) : null}
        {extraInfo ? (
          <XStack>
            <Paragraph fontSize="$1" opacity={0.5}>
              {extraInfo}
            </Paragraph>
          </XStack>
        ) : null}
      </YStack>
    </Card>
  )
}
