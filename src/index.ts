import ExpoPlaybackModule, {
  SkipSegment,
  PlaybackStatus,
  SkipSegmentEvent,
  SqLiteTableUpdatedEvent,
} from "./ExpoPlaybackModule"

export { SkipSegment, PlaybackStatus, SkipSegmentEvent }

export function play(episodeId: number): Promise<void> {
  return ExpoPlaybackModule.play(episodeId)
}

export function pause(): Promise<void> {
  return ExpoPlaybackModule.pause()
}

export function seekTo(position: number): Promise<void> {
  return ExpoPlaybackModule.seekTo(position)
}

export function startBackgroundDownload(episodeId: number): void {
  return ExpoPlaybackModule.startBackgroundDownload(episodeId)
}

export function cleanup(): void {
  return ExpoPlaybackModule.cleanup()
}

export function addPlaybackStatusListener(listener: (event: PlaybackStatus) => void) {
  return ExpoPlaybackModule.addListener("onPlaybackStatusUpdate", listener)
}

export function addSqLiteTableUpdatedListener(listener: (event: SqLiteTableUpdatedEvent) => void) {
  return ExpoPlaybackModule.addListener("onSqLiteTableUpdate", listener)
}

export function addSkipSegmentListener(listener: (event: SkipSegmentEvent) => void) {
  return ExpoPlaybackModule.addListener("onSkipSegmentReached", listener)
}
