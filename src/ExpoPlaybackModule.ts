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

export interface EpisodeMetadataUpdateDownloadProgressEvent {
  episodeId: number
  downloadProgress: number
}

export interface EpisodeMetadataUpdatePlaybackEvent {
  episodeId: number
  playback: number
}

/**
 * This event is sent when the core episode metadata is updated.
 * Core means everything but the playback and download progress.
 */
export interface CoreEpisodeMetadataUpdateEvent {
  episodeId: number
  trigger: "downloadFinished" | "deletedAudioFile" | null
}

declare class ExpoPlaybackModule extends NativeModule<{
  onSqLiteTableUpdate: (event: SqLiteTableUpdatedEvent) => void
  onPlayerStateUpdate: (event: PlayerState) => void
  onSkipSegmentReached: (event: SkipSegmentEvent) => void
  onEpisodeMetadataUpdateDownloadProgress: (
    event: EpisodeMetadataUpdateDownloadProgressEvent,
  ) => void
  onEpisodeMetadataUpdatePlayback: (event: EpisodeMetadataUpdatePlaybackEvent) => void
  onCoreEpisodeMetadataUpdate: (event: CoreEpisodeMetadataUpdateEvent) => void
}> {
  play(episodeId: number): void
  pause(): void
  startBackgroundDownload(episodeId: number): void
  seekTo(position: number): void
  skip(seconds: number): void
  cleanup(): void
  getState(): PlayerState
  findNextUnfinishedEpisodeId(episodeId: number): number
  deleteEpisodeAudioFile(episodeId: number): Promise<void>
  toggleIsFinished(episodeId: number): void
}

export default requireNativeModule<ExpoPlaybackModule>("ExpoPlayback")
