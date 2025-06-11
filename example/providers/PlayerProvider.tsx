import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { AppState } from "react-native"

import { useGetLiveLocalEpisodeQuery } from "../clients/local.queries"
import { LocalEpisode } from "../types/db.types"
import { PlayerState } from "expo-playback/ExpoPlaybackModule"
import { addPlayerStateListener, getPlayerState, pause, play, seek, skip } from "expo-playback"

type PlayerContextType = {
  togglePlayPause: VoidFunction
  activeEpisode: ReturnType<typeof useGetLiveLocalEpisodeQuery>["data"][number]
  setActiveEpisodeId: (id: LocalEpisode["id"] | null) => void
  skipBackward: VoidFunction
  skipForward: VoidFunction
  onSliderValueChange: (id: number[]) => void
  isPlaying: boolean
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null)
  const { data: activeEpisodeData } = useGetLiveLocalEpisodeQuery({
    id: playerState?.currentEpisodeId?.toString() ?? null,
  })

  useEffect(() => {
    setPlayerState(getPlayerState())
  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        setPlayerState(getPlayerState())
      }
    })

    return () => {
      subscription.remove()
    }
  }, [])

  useEffect(() => {
    const subscription = addPlayerStateListener((newPlayerState: PlayerState) => {
      setPlayerState((prevState) => {
        // do not update if just the current time has changed
        if (
          prevState?.currentEpisodeId === newPlayerState.currentEpisodeId &&
          prevState?.status === newPlayerState.status
        ) {
          return prevState
        }
        return newPlayerState
      })
    })

    return subscription.remove
  }, [])

  const setActiveEpisodeId = useCallback((id: number | null) => {
    if (!id) return
    play(id)
  }, [])

  // Player controls
  const togglePlayPause = useCallback(() => {
    if (!playerState) {
      return
    }

    if (playerState?.status === "playing") {
      pause()
      return
    }

    if (!playerState.currentEpisodeId) {
      console.warn("No episode id to play")
      return
    }

    play(playerState.currentEpisodeId)
  }, [playerState?.currentEpisodeId, playerState?.status])

  const skipBackward = useCallback(() => {
    skip(-15)
  }, [])

  const skipForward = useCallback(() => {
    skip(15)
  }, [])

  const onSliderValueChange = useCallback((value: number[]) => {
    seek(value[0])
  }, [])

  return (
    <PlayerContext.Provider
      value={{
        togglePlayPause,
        activeEpisode: activeEpisodeData?.[0] ?? null,
        setActiveEpisodeId,
        skipBackward,
        skipForward,
        onSliderValueChange,
        isPlaying: playerState?.status === "playing",
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
