import ExpoPlaybackModule, {
  SkipSegment,
  PlaybackStatus,
  SkipSegmentEvent,
} from "./ExpoPlaybackModule";

export { SkipSegment, PlaybackStatus, SkipSegmentEvent };

export function initializePlayer(
  url: string,
  segments: SkipSegment[]
): Promise<void> {
  return ExpoPlaybackModule.initializePlayer(url, segments);
}

export function play(): Promise<void> {
  return ExpoPlaybackModule.play();
}

export function pause(): Promise<void> {
  return ExpoPlaybackModule.pause();
}

export function seekTo(position: number): Promise<void> {
  return ExpoPlaybackModule.seekTo(position);
}

export function updateSkipSegments(segments: SkipSegment[]): void {
  return ExpoPlaybackModule.updateSkipSegments(segments);
}

export function cleanup(): void {
  return ExpoPlaybackModule.cleanup();
}

export function addPlaybackStatusListener(
  listener: (event: PlaybackStatus) => void
) {
  return ExpoPlaybackModule.addListener("onPlaybackStatusUpdate", listener);
}

export function addSkipSegmentListener(
  listener: (event: SkipSegmentEvent) => void
) {
  return ExpoPlaybackModule.addListener("onSkipSegmentReached", listener);
}
