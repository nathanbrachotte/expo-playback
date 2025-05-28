import { Check, Download, Play } from "@tamagui/lucide-icons"
import ExpoPlaybackModule from "expo-playback/ExpoPlaybackModule"
import React, { ComponentProps } from "react"
import { Button, ButtonProps, Paragraph, Spinner } from "tamagui"

import { PureXStack } from "./PureStack"
import { useGetLiveLocalEpisodeMetadataQuery } from "../clients/local.queries"

export function ButtonList({ icon, text, onPress }: { icon: React.ReactNode; text: string; onPress: () => void }) {
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
      // disabled={isPlayed}
      circular
      size="$3"
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
}: {
  Component: React.ComponentType<IconProps>
  color?: string
}) => {
  return <Component size="$1" strokeWidth={2.5} color={color} />
}

export function PlayButton({
  isDownloaded,
  isDownloading,
  episodeId,
  onPress,
  ...props
}: {
  isDownloaded?: boolean
  isDownloading?: boolean
  episodeId: number
} & ButtonProps) {
  if (isDownloaded) {
    return (
      <PureXStack centered themeInverse>
        <GhostButton onPress={() => {}} Icon={<CustomButtonIcon Component={Play} />} {...props} />
      </PureXStack>
    )
  }

  if (isDownloading) {
    return (
      <PureXStack centered>
        <Spinner size="small" />
      </PureXStack>
    )
  }

  return (
    <PureXStack centered>
      <GhostButton
        onPress={() => ExpoPlaybackModule.startBackgroundDownload(episodeId)}
        Icon={<CustomButtonIcon Component={Download} />}
        {...props}
      />
    </PureXStack>
  )
}

/**
 * @deprecated Use PlayButton
 */
export function DownloadButton({ episodeId, showLabel = false }: { episodeId: number; showLabel?: boolean }) {
  const { data: localEpisodeMetadata } = useGetLiveLocalEpisodeMetadataQuery(episodeId)
  const downloadProgress = localEpisodeMetadata?.[0]?.episodeMetadata?.downloadProgress ?? 0
  const isDownloading = downloadProgress > 0 && downloadProgress < 100
  const isDownloaded = downloadProgress === 100

  return (
    <Button
      icon={
        isDownloading ? (
          <PureXStack width={16} overflow="visible">
            <Paragraph textAlign="center" width={32} ml={-8}>
              {downloadProgress}%
            </Paragraph>
          </PureXStack>
        ) : isDownloaded ? (
          <Check color="$green10" />
        ) : (
          Download
        )
      }
      onPress={() => {
        if (!isDownloading && !isDownloaded) {
          ExpoPlaybackModule.startBackgroundDownload(episodeId)
        }
      }}
    />
  )
}
