import ExpoPlaybackModule, {
  SkipSegment,
  PlaybackStatus,
  SkipSegmentEvent,
  SqLiteTableUpdatedEvent,
  PlayerState,
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

export function removeDownload(episodeId: number): void {
  // TODO: Erik - implement this
  ExpoPlaybackModule.removeDownload(episodeId)
}

export function getPlayerState(): PlayerState {
  return ExpoPlaybackModule.getState()
}

export function stop(): void {
  ExpoPlaybackModule.stop()
}

export function skip(seconds: number): void {
  ExpoPlaybackModule.skip(seconds)
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
