import ExpoPlaybackModule, {
  SkipSegment,
  PlaybackStatus,
  SkipSegmentEvent,
  SqLiteTableUpdatedEvent,
  PlayerState,
  EpisodeMetadataUpdateDownloadProgressEvent,
  EpisodeMetadataUpdatePlaybackEvent,
  CoreEpisodeMetadataUpdateEvent,
} from "./ExpoPlaybackModule"

export { SkipSegment, PlaybackStatus, SkipSegmentEvent }

export function play(episodeId: number): void {
  ExpoPlaybackModule.play(episodeId)
}

export function pause(): void {
  ExpoPlaybackModule.pause()
}

export function seek(position: number): void {
  ExpoPlaybackModule.seek(position)
}

export function startBackgroundDownload(episodeId: number): void {
  ExpoPlaybackModule.startBackgroundDownload(episodeId)
}

export function getPlayerState(): PlayerState {
  return ExpoPlaybackModule.getState()
}

export function findNextUnfinishedEpisodeId(episodeId: number): number {
  return ExpoPlaybackModule.findNextUnfinishedEpisodeId(episodeId)
}

export function stop(): void {
  ExpoPlaybackModule.stop()
}

export function skip(seconds: number): void {
  ExpoPlaybackModule.skip(seconds)
}

export function deleteEpisodeAudioFile(episodeId: number): Promise<void> {
  return ExpoPlaybackModule.deleteEpisodeAudioFile(episodeId)
}

export function addPlayerStateListener(listener: (event: PlayerState) => void) {
  return ExpoPlaybackModule.addListener("onPlayerStateUpdate", listener)
}

export function addSqLiteTableUpdatedListener(listener: (event: SqLiteTableUpdatedEvent) => void) {
  return ExpoPlaybackModule.addListener("onSqLiteTableUpdate", listener)
}

export function addSkipSegmentListener(listener: (event: SkipSegmentEvent) => void) {
  return ExpoPlaybackModule.addListener("onSkipSegmentReached", listener)
}

export function toggleIsFinished(episodeId: number): void {
  ExpoPlaybackModule.toggleIsFinished(episodeId)
}

export function addEpisodeMetadataUpdateDownloadProgressListener(
  listener: (event: EpisodeMetadataUpdateDownloadProgressEvent) => void,
) {
  return ExpoPlaybackModule.addListener("onEpisodeMetadataUpdateDownloadProgress", listener)
}

export function addEpisodeMetadataUpdatePlaybackListener(
  listener: (event: EpisodeMetadataUpdatePlaybackEvent) => void,
) {
  return ExpoPlaybackModule.addListener("onEpisodeMetadataUpdatePlayback", listener)
}

export function addCoreEpisodeMetadataUpdateListener(
  listener: (event: CoreEpisodeMetadataUpdateEvent) => void,
) {
  return ExpoPlaybackModule.addListener("onCoreEpisodeMetadataUpdate", listener)
}
