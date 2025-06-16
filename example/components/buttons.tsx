import { Check, Download, Pause, Play } from "@tamagui/lucide-icons"
import React, { ComponentProps, useCallback } from "react"
import { Button, ButtonProps, getVariable, Paragraph, Spinner } from "tamagui"

import { PureXStack } from "./PureStack"
import {
  useGetLiveLocalEpisodeMetadataQuery,
  useGetLiveLocalEpisodeQuery,
} from "../clients/local.queries"
import { pause, play, startBackgroundDownload } from "expo-playback"
import { usePlayerContext } from "../providers/PlayerProvider"
import {
  getEpisodeStateFromMetadata,
  getEpisodeStateFromMetadataWithoutDuration,
} from "../utils/metadata.utils"

export function ButtonList({
  icon,
  text,
  onPress,
}: {
  icon: React.ReactNode
  text: string
  onPress: () => void
}) {
  return (
    <Button onPress={onPress} borderRadius="$4" w="100%" justifyContent="flex-start" px="$2" h="$6">
      <PureXStack gap="$3" ai="center" jc="flex-start">
        <PureXStack p="$3" bg="$color2" borderRadius="$4">
          {icon}
        </PureXStack>
        <Paragraph size="$6">{text}</Paragraph>
      </PureXStack>
    </Button>
  )
}

export function GhostButton({
  Icon,
  onPress,
  showBg,
  ...props
}: {
  Icon: ComponentProps<typeof Button>["icon"]
  showBg?: boolean
  onPress: () => void
} & ButtonProps) {
  return (
    <Button
      icon={Icon}
      onPress={onPress}
      circular
      size="$3"
      bg={showBg ? "$background" : "transparent"}
      {...props}
    />
  )
}

type IconProps = {
  color?: string
  size?: string | number
  strokeWidth?: number | string
}

export const CustomButtonIcon = ({
  Component,
  color,
  size,
}: {
  Component: React.ComponentType<IconProps>
  color?: string
  size?: number
}) => {
  return <Component size={size} strokeWidth={2.5} color={color} />
}

export function PlayButton({
  episodeId,
  onPress,
  size = "$4",
  // Component
  ...props
}: {
  isDownloaded?: boolean
  isDownloading?: boolean
  episodeId: number
  size?: React.ComponentProps<typeof Button>["size"]
  // Component: React.ComponentType<typeof Button>
} & ButtonProps) {
  // Make iconSize scale based on size
  const iconSize = getVariable(size) * 0.5
  const { activeEpisode, isPlaying } = usePlayerContext()
  const { data: localEpisodeMetadata } = useGetLiveLocalEpisodeMetadataQuery(episodeId)
  // TODO: Erik - use getEpisodeStateFromMetadata
  const downloadProgress = localEpisodeMetadata?.[0]?.episodeMetadata?.downloadProgress ?? 0
  const isDownloaded = downloadProgress === 100
  const isDownloading = downloadProgress > 0 && downloadProgress < 100

  const isEpisodePlaying = activeEpisode?.episode?.id === episodeId && isPlaying

  const handlePlayPause = useCallback(() => {
    if (isEpisodePlaying) {
      pause()
    } else {
      play(episodeId)
    }
  }, [isEpisodePlaying, episodeId])

  if (isDownloading) {
    return (
      <PureXStack centered>
        <Spinner size="small" />
      </PureXStack>
    )
  }

  return (
    <PureXStack centered themeInverse>
      <GhostButton
        size={size}
        showBg
        onPress={handlePlayPause}
        Icon={<CustomButtonIcon Component={isEpisodePlaying ? Pause : Play} size={iconSize} />}
        {...props}
      />
    </PureXStack>
  )
}

export function DownloadButton({
  episodeId,
  size = "$4",
  ...props
}: {
  episodeId: number
  size?: React.ComponentProps<typeof Button>["size"]
} & ButtonProps) {
  const { data: localEpisodeMetadata } = useGetLiveLocalEpisodeMetadataQuery(episodeId)
  const { isDownloaded, isDownloading } = getEpisodeStateFromMetadataWithoutDuration(
    localEpisodeMetadata?.[0]?.episodeMetadata ?? {},
  )

  return (
    <PureXStack centered themeInverse>
      <GhostButton
        size={size}
        showBg
        onPress={() => {
          startBackgroundDownload(episodeId)
        }}
        Icon={<CustomButtonIcon Component={Download} size={iconSize} />}
        {...props}
      />
    </PureXStack>
  )
}
