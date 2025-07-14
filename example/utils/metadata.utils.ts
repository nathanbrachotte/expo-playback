import { LocalEpisodeMetadata } from "../types/db.types"

export type PrettyMetadata = {
  isFinished: boolean
  isDownloaded: boolean
  isDownloading: boolean
  progress: number
  progressPercentage: number
  downloadProgress: number
  isInProgress: boolean
  duration: number
}

export function getProgressPercentageFromMetadata(
  metadata: LocalEpisodeMetadata | undefined,
): number {
  if (!metadata || !metadata.duration) {
    return 0
  }

  return Math.min(100, Math.ceil(((metadata.playback ?? 0) / metadata.duration) * 100))
}

export function getIsDownloadedFromMetadata(metadata: LocalEpisodeMetadata | undefined): boolean {
  if (!metadata) {
    return false
  }

  return metadata.downloadProgress === 100
}

export function getIsDownloadingFromMetadata(metadata: LocalEpisodeMetadata | undefined): boolean {
  if (!metadata) {
    return false
  }

  if (metadata?.downloadProgress == null) {
    return false
  }

  if (metadata?.downloadProgress === 100) {
    return false
  }

  if (metadata?.downloadProgress === 0) {
    return false
  }

  return true
}

export function getEpisodeStateFromMetadata(
  metadata: LocalEpisodeMetadata | undefined | null,
): PrettyMetadata {
  const progressPercentage = getProgressPercentageFromMetadata(metadata ?? undefined)

  return {
    isFinished: metadata?.isFinished ?? false,
    isDownloaded: getIsDownloadedFromMetadata(metadata ?? undefined),
    isDownloading: getIsDownloadingFromMetadata(metadata ?? undefined),
    downloadProgress: metadata?.downloadProgress ?? 0,
    progress: metadata?.playback ?? 0,
    progressPercentage,
    isInProgress: progressPercentage > 0,
    duration: metadata?.duration ?? 0,
  }
}
