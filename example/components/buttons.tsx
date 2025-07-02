import { Check, Download, Play, Trash2 } from "@tamagui/lucide-icons"
import React, { ComponentProps, useCallback } from "react"
import { Button, ButtonProps, getVariable, Paragraph, Spinner } from "tamagui"

import { PureXStack } from "./PureStack"
import {
  useGetLiveLocalEpisodeMetadataQuery,
  useGetLiveLocalEpisodeQuery,
} from "../clients/local.queries"
import { pause, play, startBackgroundDownload } from "expo-playback"
import { usePlayerContext } from "../providers/PlayerProvider"
import { getEpisodeStateFromMetadata } from "../utils/metadata.utils"
import { useDeleteEpisodeMetadataAndAudioFileMutation } from "../clients/local.mutations"
import { Pause } from "../assets/Pause"

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
  ...props
}: {
  Component: React.ComponentType<IconProps>
  color?: string
  size?: number
} & IconProps) => {
  return <Component size={size} strokeWidth={2.5} color={color} {...props} />
}

function PlayButtonIcon({
  isEpisodePlaying,
  isDownloading,
  iconSize,
}: {
  isEpisodePlaying: boolean
  isDownloading: boolean
  iconSize: number
}) {
  if (isDownloading) {
    return <Spinner size="small" />
  }

  if (isEpisodePlaying) {
    return <Pause width={iconSize * 0.9} height={iconSize * 0.9} />
  }

  return <Play />
}

export function PlayButton({
  episodeId,
  size = "$4",
  ...props
}: {
  episodeId: number
  size?: React.ComponentProps<typeof Button>["size"]
} & ButtonProps) {
  const iconSize = getVariable(size) * 0.5
  const { activeEpisode, isPlaying, setEpisodeIdForPlayAfterDownload } = usePlayerContext()

  const { data: localEpisodeMetadata } = useGetLiveLocalEpisodeMetadataQuery(episodeId, {
    downloadProgress: true,
    playback: false,
  })
  const { isDownloaded, isDownloading } = getEpisodeStateFromMetadata(
    localEpisodeMetadata?.episodeMetadata,
  )

  const isEpisodePlaying = activeEpisode?.episode?.id === episodeId && isPlaying

  const handlePlayPause = useCallback(() => {
    if (isDownloading) {
      return
    }

    if (!isDownloaded) {
      startBackgroundDownload(episodeId)
      setEpisodeIdForPlayAfterDownload(episodeId)
      return
    }

    if (isEpisodePlaying) {
      pause()
      return
    }

    play(episodeId)
  }, [isEpisodePlaying, episodeId, isDownloaded, isDownloading, setEpisodeIdForPlayAfterDownload])

  return (
    <PureXStack centered themeInverse>
      <GhostButton
        size={size}
        showBg
        onPress={handlePlayPause}
        Icon={
          <PlayButtonIcon
            isEpisodePlaying={isEpisodePlaying}
            isDownloading={isDownloading}
            iconSize={iconSize}
          />
        }
        {...props}
      />
    </PureXStack>
  )
}

export function DownloadButton({
  episodeId,
  size = "$3",
  ...props
}: {
  episodeId: number
  size?: React.ComponentProps<typeof Button>["size"]
} & ButtonProps) {
  // Make iconSize scale based on size
  const iconSize = getVariable(size) * 0.5
  const deleteMetadataMutation = useDeleteEpisodeMetadataAndAudioFileMutation()

  const { data: localEpisodeMetadata } = useGetLiveLocalEpisodeMetadataQuery(episodeId, {
    downloadProgress: true,
    playback: false,
  })
  const { isDownloaded, isDownloading } = getEpisodeStateFromMetadata(
    localEpisodeMetadata?.episodeMetadata,
  )

  if (isDownloading) {
    return (
      <GhostButton
        size={size}
        showBg
        disabled
        onPress={() => {}}
        Icon={<Spinner size="small" />}
        {...props}
      />
    )
  }

  if (isDownloaded) {
    return (
      <GhostButton
        size={size}
        showBg
        onPress={() => {
          deleteMetadataMutation.mutate(episodeId)
        }}
        Icon={<CustomButtonIcon Component={Trash2} size={iconSize} color="$red8" />}
        {...props}
      />
    )
  }

  return (
    <GhostButton
      size={size}
      showBg
      onPress={() => {
        startBackgroundDownload(episodeId)
      }}
      Icon={<CustomButtonIcon Component={Download} size={iconSize} />}
      {...props}
    />
  )
}

export function PlayButtonsSection({ episodeId }: { episodeId: number }) {
  return (
    <PureXStack gap="$3" centered>
      <DownloadButton episodeId={episodeId} />
      <PlayButton episodeId={episodeId} />
    </PureXStack>
  )
}

export function MarkAsFinishedButton({ episodeId }: { episodeId: number }) {
  const iconSize = getVariable("$3") * 0.5
  const { data: localEpisodeMetadata } = useGetLiveLocalEpisodeMetadataQuery(episodeId, {
    downloadProgress: false,
    playback: true,
  })
  const { isFinished } = getEpisodeStateFromMetadata(localEpisodeMetadata?.episodeMetadata)

  if (isFinished) {
    return (
      <GhostButton
        size="$3"
        showBg
        onPress={() => {}}
        Icon={<CustomButtonIcon Component={Check} size={iconSize} />}
      />
    )
  }

  return (
    <GhostButton
      size="$3"
      showBg
      onPress={() => {}}
      Icon={<CustomButtonIcon Component={Check} size={iconSize} />}
    />
  )
}
