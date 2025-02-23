import { requireNativeModule, NativeModule } from "expo-modules-core";

export interface SkipSegment {
  startTime: number;
  endTime: number;
}

export interface PlaybackStatus {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

export interface SkipSegmentEvent {
  startTime: number;
  endTime: number;
}

declare class ExpoPlaybackModule extends NativeModule<{
  onPlaybackStatusUpdate: (event: PlaybackStatus) => void;
  onSkipSegmentReached: (event: SkipSegmentEvent) => void;
}> {
  initializePlayer(url: string, segments: SkipSegment[]): Promise<void>;
  play(): Promise<void>;
  pause(): Promise<void>;
  seekTo(position: number): Promise<void>;
  updateSkipSegments(segments: SkipSegment[]): void;
  cleanup(): void;
}

export default requireNativeModule<ExpoPlaybackModule>("ExpoPlayback");
