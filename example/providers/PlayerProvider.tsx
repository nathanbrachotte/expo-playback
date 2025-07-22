import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { AppState } from "react-native"

import { useGetLiveLocalEpisodeQuery } from "../clients/local.queries"
import { LocalEpisode } from "../types/db.types"
import { PlayerState } from "expo-playback/ExpoPlaybackModule"
import {
  addCoreEpisodeMetadataUpdateListener,
  addPlayerStateListener,
  getPlayerState,
  pause,
  play,
  seek,
  skip,
} from "expo-playback"

type PlayerContextType = {
  togglePlayPause: VoidFunction
  activeEpisode: ReturnType<typeof useGetLiveLocalEpisodeQuery>["data"][number]
  setActiveEpisodeId: (id: LocalEpisode["id"] | null) => void
  skipBackward: VoidFunction
  skipForward: VoidFunction
  onSliderValueChange: (id: number[]) => void
  setEpisodeIdForPlayAfterDownload: (id: number) => void
  isPlaying: boolean
}

const PlayerContext = createContext<PlayerContextType | null>(null)

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [playerState, setPlayerState] = useState<PlayerState | null>(null)
  const [episodeIdForPlayAfterDownload, setEpisodeIdForPlayAfterDownload] = useState<number>()
  const { data: activeEpisodeData } = useGetLiveLocalEpisodeQuery({
    id: playerState?.currentEpisodeId?.toString() ?? null,
  })

  useEffect(() => {
    setPlayerState(getPlayerState())
  }, [])

  useEffect(() => {
    const subscription = addCoreEpisodeMetadataUpdateListener(({ episodeId, trigger }) => {
      if (episodeId !== episodeIdForPlayAfterDownload) {
        return
      }

      if (trigger !== "downloadFinished") {
        return
      }

      play(episodeIdForPlayAfterDownload)
      setEpisodeIdForPlayAfterDownload(undefined)
    })

    return subscription.remove
  }, [episodeIdForPlayAfterDownload])

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

  // If the player is playing a different episode, reset the episode id for play after download
  // since the user intended to play something else between starting the download and the download finishing
  useEffect(() => {
    setEpisodeIdForPlayAfterDownload(undefined)
  }, [playerState?.currentEpisodeId])

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
        setEpisodeIdForPlayAfterDownload,
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
