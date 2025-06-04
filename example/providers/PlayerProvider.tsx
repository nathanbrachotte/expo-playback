import * as FileSystem from "expo-file-system"
import * as ExpoPlayback from "expo-playback"
import { createContext, useContext, useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { useGetLiveLocalEpisodeQuery, useGetLatestEpisodeQuery } from "../clients/local.queries"
import { LocalEpisode } from "../types/db.types"

const AUDIO_DIRECTORY = FileSystem.documentDirectory + "audio/"
const ACTIVE_EPISODE_KEY = "@player/active_episode_id"

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
  activeEpisode: ReturnType<typeof useGetLiveLocalEpisodeQuery>["data"][number]
  setActiveEpisodeId: (id: LocalEpisode["id"] | null) => void
  skipBackward: VoidFunction
  skipForward: VoidFunction
  onSliderValueChange: (id: number[]) => void
  progress: number
  isPlaying: boolean
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [activeEpisodeId, setActiveEpisodeIdState] = useState<LocalEpisode["id"] | null>(null)
  const { data: activeEpisodeData } = useGetLiveLocalEpisodeQuery({
    id: activeEpisodeId?.toString() ?? null,
  })
  const { data: latestEpisodeData } = useGetLatestEpisodeQuery()

  // Load persisted episode ID on mount
  useEffect(() => {
    async function loadPersistedEpisode() {
      try {
        const persistedId = await AsyncStorage.getItem(ACTIVE_EPISODE_KEY)
        if (persistedId) {
          setActiveEpisodeIdState(Number(persistedId))
          return
        }

        if (latestEpisodeData?.[0]?.episode?.id) {
          // If no persisted episode, use the latest one
          setActiveEpisodeIdState(latestEpisodeData[0].episode.id)
        }
      } catch (error) {
        console.error("Error loading persisted episode:", error)
      }
    }
    loadPersistedEpisode()
  }, [latestEpisodeData])

  // Persist episode ID when it changes
  const setActiveEpisodeId = async (id: LocalEpisode["id"] | null) => {
    try {
      if (id) {
        await AsyncStorage.setItem(ACTIVE_EPISODE_KEY, id.toString())
      } else {
        await AsyncStorage.removeItem(ACTIVE_EPISODE_KEY)
      }
      setActiveEpisodeIdState(id)
    } catch (error) {
      console.error("Error persisting episode ID:", error)
    }
  }

  const activeEpisode = activeEpisodeData?.[0]?.episode
  const activeEpisodeDuration = activeEpisodeData?.[0]?.episode?.duration
  const activeEpisodePlaybackPosition = activeEpisodeData?.[0]?.episodeMetadata?.playback
  const url = activeEpisode?.downloadUrl

  const [isPlaying, setIsPlaying] = useState(false)

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

        // Listen for playback status updates
        const statusSubscription = ExpoPlayback.addPlaybackStatusListener((status) => {
          setIsPlaying(status.isPlaying)
          // TODO: Set time to metadata
          // setCurrentTime(status.currentTime)
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
    if (!activeEpisodeId) return

    if (isPlaying) {
      ExpoPlayback.pause()
    } else {
      ExpoPlayback.play(activeEpisodeId)
    }
  }

  const skipBackward = () => {
    if (!activeEpisodePlaybackPosition) {
      return
    }

    const newTime = Math.max(0, activeEpisodePlaybackPosition - 15)
    ExpoPlayback.seekTo(newTime)
  }

  const skipForward = () => {
    if (!activeEpisodePlaybackPosition) {
      return
    }

    const newTime = Math.min(activeEpisodeDuration ?? 0, activeEpisodePlaybackPosition + 30)
    ExpoPlayback.seekTo(newTime)
  }

  const onSliderValueChange = (value: number[]) => {
    // TODO: Update progress in the database
    ExpoPlayback.seekTo(value[0])
  }

  return (
    <PlayerContext.Provider
      value={{
        togglePlayPause,
        activeEpisode: activeEpisodeData?.[0],
        setActiveEpisodeId,
        skipBackward,
        skipForward,
        onSliderValueChange,
        progress: activeEpisodePlaybackPosition ?? 0,
        isPlaying,
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
