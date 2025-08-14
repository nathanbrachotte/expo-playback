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

const ENABLE_LOGS = false

export function play(episodeId: number): void {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Play")
  ExpoPlaybackModule.play(episodeId)
}

export function pause(): void {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Pause")
  ExpoPlaybackModule.pause()
}

export function seek(position: number): void {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Seek")
  ExpoPlaybackModule.seek(position)
}

export function startBackgroundDownload(episodeId: number): void {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Start Background Download")
  ExpoPlaybackModule.startBackgroundDownload(episodeId)
}

export function getPlayerState(): PlayerState {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Get Player State")
  return ExpoPlaybackModule.getState()
}

export function findNextUnfinishedEpisodeId(episodeId: number): number {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Find Next Unfinished Episode Id")
  return ExpoPlaybackModule.findNextUnfinishedEpisodeId(episodeId)
}

export function stop(): void {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Stop")
  ExpoPlaybackModule.stop()
}

export function skip(seconds: number): void {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Skip")
  ExpoPlaybackModule.skip(seconds)
}

export function deleteEpisodeAudioFile(episodeId: number): Promise<void> {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Delete Episode Audio File")
  return ExpoPlaybackModule.deleteEpisodeAudioFile(episodeId)
}

export function addPlayerStateListener(listener: (event: PlayerState) => void) {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Add Player State Listener")
  return ExpoPlaybackModule.addListener("onPlayerStateUpdate", listener)
}

export function addSqLiteTableUpdatedListener(listener: (event: SqLiteTableUpdatedEvent) => void) {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Add SqLite Table Updated Listener")
  return ExpoPlaybackModule.addListener("onSqLiteTableUpdate", listener)
}

export function addSkipSegmentListener(listener: (event: SkipSegmentEvent) => void) {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Add Skip Segment Listener")
  return ExpoPlaybackModule.addListener("onSkipSegmentReached", listener)
}

export function toggleIsFinished(episodeId: number): void {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Toggle Is Finished")
  ExpoPlaybackModule.toggleIsFinished(episodeId)
}

export function addEpisodeMetadataUpdateDownloadProgressListener(
  listener: (event: EpisodeMetadataUpdateDownloadProgressEvent) => void,
) {
  ENABLE_LOGS &&
    console.log("ACROSS THE BRIDGE: Add Episode Metadata Update Download Progress Listener")
  return ExpoPlaybackModule.addListener("onEpisodeMetadataUpdateDownloadProgress", listener)
}

export function addEpisodeMetadataUpdatePlaybackListener(
  listener: (event: EpisodeMetadataUpdatePlaybackEvent) => void,
) {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Add Episode Metadata Update Playback Listener")
  return ExpoPlaybackModule.addListener("onEpisodeMetadataUpdatePlayback", listener)
}

export function addCoreEpisodeMetadataUpdateListener(
  listener: (event: CoreEpisodeMetadataUpdateEvent) => void,
) {
  ENABLE_LOGS && console.log("ACROSS THE BRIDGE: Add Core Episode Metadata Update Listener")
  return ExpoPlaybackModule.addListener("onCoreEpisodeMetadataUpdate", listener)
}
