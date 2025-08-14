import { Check, Download, Play, Trash2 } from "@tamagui/lucide-icons"
import React, { ComponentProps, useCallback } from "react"
import { Button, ButtonProps, getVariable, Paragraph, Spinner, styled } from "tamagui"

import { PureXStack } from "./PureStack"
import { pause, play, startBackgroundDownload, toggleIsFinished } from "expo-playback"
import { usePlayerContext } from "../providers/PlayerProvider"
import { useDeleteEpisodeMetadataAndAudioFileMutation } from "../clients/local.mutations"
import { Pause } from "../assets/Pause"
import { CircularLoader } from "./CircularLoader"
import { useGetEpisodePrettyMetadata } from "../hooks/useGetEpisodePrettyMetadata"

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

export const PureButton = styled(Button, {
  variants: {
    variant: {
      destructive: {
        bg: "$red5",
        color: "$red11",
      },
      ghost: {
        color: "$color11",
        circular: true,
      },
    },
  },
})

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
  downloadProgress,
}: {
  isEpisodePlaying: boolean
  isDownloading: boolean
  iconSize: number
  downloadProgress: number
}) {
  if (isDownloading) {
    return (
      <CircularLoader progress={downloadProgress} size={iconSize} color="#000000" strokeWidth={3} />
    )
  }

  if (isEpisodePlaying) {
    return <Pause size={iconSize * 1.1} />
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

  const { isDownloaded, isDownloading, progressPercentage } = useGetEpisodePrettyMetadata(
    episodeId,
    {
      downloadProgress: false,
      playback: true,
    },
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
      <PureButton
        size={size}
        variant="ghost"
        onPress={handlePlayPause}
        icon={
          <PlayButtonIcon
            isEpisodePlaying={isEpisodePlaying}
            isDownloading={isDownloading}
            downloadProgress={progressPercentage}
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

  const { isDownloaded, isDownloading } = useGetEpisodePrettyMetadata(episodeId, {
    downloadProgress: true,
    playback: false,
  })

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
  const { isFinished } = useGetEpisodePrettyMetadata(episodeId, {
    downloadProgress: false,
    playback: true,
  })

  return (
    <GhostButton
      size="$3"
      showBg
      color={isFinished ? "$green9" : "$color11"}
      onPress={() => {
        toggleIsFinished(episodeId)
      }}
      Icon={<CustomButtonIcon Component={Check} size={iconSize} />}
    />
  )
}
