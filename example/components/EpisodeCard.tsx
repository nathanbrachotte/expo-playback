import React from "react"
import { Pressable } from "react-native"
import { YStack, Paragraph, Image, XStack, Card } from "tamagui"

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const month = date.toLocaleString("default", { month: "short" })
  const day = date.getDate()
  const year = date.getFullYear()

  return `${month} ${day}, ${year}`
}

export const EpisodeCard = ({
  episode,
  podcastTitle,
  onPress,
}: {
  // FIXME: no any
  episode: any
  podcastTitle: string
  onPress: () => void
}) => {
  return (
    <Pressable onPress={onPress}>
      <Card size="$4" bordered marginVertical="$2" p="$4">
        <XStack gap="$3">
          {episode.image && (
            <Image source={{ uri: episode.image }} style={{ width: 70, height: 70, borderRadius: 4 }} />
          )}
          <YStack flex={1}>
            <Paragraph numberOfLines={1} fontWeight="bold">
              {episode.title}
            </Paragraph>
            <Paragraph numberOfLines={1} opacity={0.7}>
              {podcastTitle}
            </Paragraph>
            <Paragraph numberOfLines={2} opacity={0.6} fontSize="$1">
              {episode.description}
            </Paragraph>
            <XStack mt="$2">
              <Paragraph fontSize="$1" opacity={0.5}>
                {formatDate(episode.publishedAt)} • {formatDuration(episode.duration)}
              </Paragraph>
            </XStack>
          </YStack>
        </XStack>
      </Card>
    </Pressable>
  )
}
