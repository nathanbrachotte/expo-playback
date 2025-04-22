import { Play, Pause, SkipBack, SkipForward } from "@tamagui/lucide-icons"
import * as FileSystem from "expo-file-system"
import * as ExpoPlayback from "expo-playback"
import { useEffect, useState } from "react"
import { Button, H4, Slider, Text, YStack, XStack } from "tamagui"

import { usePlayerContext } from "../../providers/PlayerProvider"
import { formatTime } from "../../utils/time.utils"

type SkipSegment = {
  startTime: number
  endTime: number
}

interface PlayerProps {
  audioUrl?: string
  skipSegments?: SkipSegment[]
  episodeTitle?: string
  podcastTitle?: string
}

export function Player({
  audioUrl = "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
  skipSegments = [
    { startTime: 10, endTime: 20 },
    { startTime: 30, endTime: 40 },
    { startTime: 120, endTime: 180 },
  ],
  episodeTitle = "Sample Episode",
  podcastTitle = "Sample Podcast",
}: PlayerProps) {
  const activeEpisode = usePlayerContext()

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  // const [audioFile, setAudioFile] = useState<string | null>(null)

  useEffect(() => {
    const audioDirectory = FileSystem.documentDirectory + "audio/"

    const ensureAudioDirectory = async () => {
      try {
        const dirInfo = await FileSystem.getInfoAsync(audioDirectory)
        if (!dirInfo.exists) {
          console.log("Creating audio directory:", audioDirectory)
          await FileSystem.makeDirectoryAsync(audioDirectory, {
            intermediates: true,
          })
          console.log("Audio directory created:", audioDirectory)
        }
      } catch (error) {
        console.error("Error creating folder:", error)
      }
    }

    const setupAudio = async () => {
      // setIsLoading(true)

      await ensureAudioDirectory()

      // Generate a unique filename based on the URL
      const filename = `podcast_${Date.now()}`
      const localAudioFile = audioDirectory + filename

      try {
        await FileSystem.downloadAsync(audioUrl, localAudioFile)
        // setAudioFile(localAudioFile)

        // Initialize player
        ExpoPlayback.initializePlayer(localAudioFile, skipSegments)

        // Listen for playback status updates
        const statusSubscription = ExpoPlayback.addPlaybackStatusListener((status) => {
          setIsPlaying(status.isPlaying)
          setCurrentTime(status.currentTime)
          setDuration(status.duration)
          // if (status.duration > 0) {
          //   setIsLoading(false)
          // }
        })

        // Listen for skip segment events
        const skipSubscription = ExpoPlayback.addSkipSegmentListener((event) => {
          console.log(`Skipping segment from ${event.startTime} to ${event.endTime}`)
        })

        // Cleanup
        return () => {
          statusSubscription.remove()
          skipSubscription.remove()
          ExpoPlayback.cleanup()
        }
      } catch (error) {
        console.error("Error setting up audio:", error)
        // setIsLoading(false)
      }
    }

    setupAudio()
  }, [audioUrl])

  // Player controls
  const togglePlayPause = () => {
    if (isPlaying) {
      ExpoPlayback.pause()
    } else {
      ExpoPlayback.play()
    }
  }

  const skipBackward = () => {
    const newTime = Math.max(0, currentTime - 15)
    ExpoPlayback.seekTo(newTime)
  }

  const skipForward = () => {
    const newTime = Math.min(duration, currentTime + 30)
    ExpoPlayback.seekTo(newTime)
  }

  const onSliderValueChange = (value: number[]) => {
    ExpoPlayback.seekTo(value[0])
  }

  return (
    <YStack p="$4" borderTopWidth={1} borderColor="$borderColor" bg="$color5" position="relative">
      <XStack>
        {/* Album Art Placeholder */}
        <YStack width={50} height={50} />

        <YStack flex={1} ml="$3">
          <H4 numberOfLines={1} fontSize="$5">
            {episodeTitle}
          </H4>
          <Text numberOfLines={1} opacity={0.7} fontSize="$3">
            {podcastTitle}
          </Text>
        </YStack>
      </XStack>

      {/* Progress Bar */}
      <YStack mt="$3">
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
      </YStack>

      {/* Controls */}
      <XStack mt="$3" mb="$1" justifyContent="center" alignItems="center">
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
      </XStack>

      {/* Loading indicator */}
      {isLoading && (
        <YStack mt="$2">
          <Text opacity={0.7}>Loading audio...</Text>
        </YStack>
      )}
    </YStack>
  )
}
