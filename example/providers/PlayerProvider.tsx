import * as FileSystem from "expo-file-system"
import * as ExpoPlayback from "expo-playback"
import { createContext, useContext, useEffect, useState } from "react"

import { useGetLiveLocalEpisodeQuery } from "../clients/local.queries"
import { LocalEpisode } from "../types/db.types"

const AUDIO_DIRECTORY = FileSystem.documentDirectory + "audio/"

async function ensureAudioDirectory() {
  try {
    const dirInfo = await FileSystem.getInfoAsync(AUDIO_DIRECTORY)
    if (!dirInfo.exists) {
      console.log("Creating audio directory:", AUDIO_DIRECTORY)
      await FileSystem.makeDirectoryAsync(AUDIO_DIRECTORY, {
        intermediates: true,
      })
      console.log("Audio directory created:", AUDIO_DIRECTORY)
    }
  } catch (error) {
    console.error("Error creating folder:", error)
  }
}

type PlayerContextType = {
  togglePlayPause: VoidFunction
  activeEpisode: LocalEpisode
  setActiveEpisodeId: (id: LocalEpisode["id"] | null) => void
  skipBackward: VoidFunction
  skipForward: VoidFunction
  onSliderValueChange: (id: number[]) => void
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeEpisodeId, setActiveEpisodeId] = useState<LocalEpisode["id"] | null>(null)
  const { data } = useGetLiveLocalEpisodeQuery({ id: activeEpisodeId?.toString() ?? null })

  const episode = data[0]?.episode
  // !FIXME: Use audio url?? Or local stuff?
  const url = episode?.downloadUrl

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function setupAudio() {
      // setIsLoading(true)

      await ensureAudioDirectory()

      // Generate a unique filename based on the URL
      const filename = `podcast_${Date.now()}`
      const localAudioFile = AUDIO_DIRECTORY + filename

      try {
        await FileSystem.downloadAsync(url, localAudioFile)
        // setAudioFile(localAudioFile)

        // Initialize player
        // ExpoPlayback.initializePlayer(localAudioFile, skipSegments)
        // TODO: Add skip segments from backend here
        ExpoPlayback.initializePlayer(localAudioFile, [])

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

    if (url) {
      setupAudio()
    }
  }, [url])

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
    <PlayerContext.Provider
      value={{
        togglePlayPause,
        activeEpisode: episode,
        setActiveEpisodeId,
        skipBackward,
        skipForward,
        onSliderValueChange,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayerContext = () => {
  const context = useContext(PlayerContext)

  if (!context) {
    throw new Error("usePlayerContext must be used within a PlayerProvider")
  }

  return context
}
