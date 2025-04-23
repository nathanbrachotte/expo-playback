import { Play, Pause, SkipBack, SkipForward } from "@tamagui/lucide-icons"
import * as FileSystem from "expo-file-system"
import * as ExpoPlayback from "expo-playback"
import { useEffect, useState } from "react"
import { Button, H4, Slider, Text, YStack, XStack } from "tamagui"
import { formatTime } from "../../utils/time.utils"
import { usePlayerContext } from "../../providers/PlayerProvider"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export function Player() {
  const { activeEpisode } = usePlayerContext()

  if (!activeEpisode) {
    return null
  }

  return (
    <YStack py="$6" px="$4" borderTopWidth={1} borderColor="$borderColor" bg="$color5">
      <XStack>
        {/* Album Art Placeholder */}
        <YStack width={50} height={50} />

        <YStack flex={1} ml="$3">
          <H4 numberOfLines={1} fontSize="$5">
            {activeEpisode.title}
          </H4>
          <Text numberOfLines={1} opacity={0.7} fontSize="$3">
            {activeEpisode.podcastId}
          </Text>
        </YStack>
      </XStack>

      {/* Progress Bar */}
      {/* <YStack mt="$3">
        <Slider
          size="$2"
          defaultValue={[0]}
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={onSliderValueChange}
          disabled={isLoading}
        >
          <Slider.Track>
            <Slider.TrackActive />
          </Slider.Track>
          <Slider.Thumb circular index={0} />
        </Slider>

        <XStack mt="$1">
          <Text fontSize="$2" flex={1}>
            {formatTime(currentTime)}
          </Text>
          <Text fontSize="$2" flex={1}>
            {formatTime(duration)}
          </Text>
        </XStack>
      </YStack> */}

      {/* Controls */}
      {/* <XStack mt="$3" mb="$1" justifyContent="center" alignItems="center">
        <YStack flex={1} />
        <Button size="$3" icon={<SkipBack size={16} />} onPress={skipBackward} disabled={isLoading} />

        <YStack mx="$4">
          <Button
            size="$6"
            circular
            theme="blue"
            icon={isPlaying ? <Pause size={24} /> : <Play size={24} />}
            onPress={togglePlayPause}
            disabled={isLoading}
          />
        </YStack>

        <Button size="$3" icon={<SkipForward size={16} />} onPress={skipForward} disabled={isLoading} />
        <YStack flex={1} />
      </XStack> */}

      {/* Loading indicator */}
      {/* {isLoading && (
        <YStack mt="$2">
          <Text opacity={0.7}>Loading audio...</Text>
        </YStack>
      )} */}
    </YStack>
  )
}
