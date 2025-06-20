import { requireNativeModule, NativeModule } from "expo-modules-core"

import { TableName } from "../example/db/schema"

export interface SkipSegment {
  startTime: number
  endTime: number
}

export interface SqLiteTableUpdatedEvent {
  table: TableName
}

export interface PlaybackStatus {
  isPlaying: boolean
  currentTime: number
  duration: number
}

export interface SkipSegmentEvent {
  startTime: number
  endTime: number
}

export interface PlayerState {
  status: "playing" | "paused" | "buffering" | "stopped"
  currentEpisodeId: number | null
  currentTime: number
}

declare class ExpoPlaybackModule extends NativeModule<{
  onSqLiteTableUpdate: (event: SqLiteTableUpdatedEvent) => void
  onPlayerStateUpdate: (event: PlayerState) => void
  onSkipSegmentReached: (event: SkipSegmentEvent) => void
}> {
  play(episodeId: number): void
  pause(): void
  startBackgroundDownload(episodeId: number): void
  seekTo(position: number): void
  skip(seconds: number): void
  cleanup(): void
  getState(): PlayerState
  deleteEpisodeAudioFileAndMetadata(episodeId: number): Promise<void>
}

export default requireNativeModule<ExpoPlaybackModule>("ExpoPlayback")
