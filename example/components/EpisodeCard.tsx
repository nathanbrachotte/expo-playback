import React from "react"
import { Pressable } from "react-native"
import { YStack, Paragraph, Image, XStack, Card } from "tamagui"

import { Optional } from "../utils/types"

export type EpisodeCardProps = {
  title: string
  subtitle: Optional<string>
  image: Optional<string>
  extraInfo: string
  podcastTitle: Optional<string>
  onPress: VoidFunction
}

export const EpisodeCard = ({ title, subtitle, image, extraInfo, podcastTitle, onPress }: EpisodeCardProps) => {
  return (
    <Pressable onPress={onPress}>
      <Card size="$4" bordered marginVertical="$2" p="$4">
        <XStack gap="$3">
          {image && <Image source={{ uri: image }} style={{ width: 70, height: 70, borderRadius: 4 }} />}
          <YStack flex={1}>
            <Paragraph numberOfLines={1} fontWeight="bold">
              {title}
            </Paragraph>
            {podcastTitle && (
              <Paragraph numberOfLines={1} opacity={0.7}>
                {podcastTitle}
              </Paragraph>
            )}
            {subtitle && (
              <Paragraph numberOfLines={2} opacity={0.6} fontSize="$1">
                {subtitle}
              </Paragraph>
            )}
            <XStack mt="$2">
              <Paragraph fontSize="$1" opacity={0.5}>
                {extraInfo}
              </Paragraph>
            </XStack>
          </YStack>
        </XStack>
      </Card>
    </Pressable>
  )
}
