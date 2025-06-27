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

  return ((metadata.playback ?? 0) / metadata.duration) * 100
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
  metadata: LocalEpisodeMetadata | undefined,
): PrettyMetadata {
  const progressPercentage = getProgressPercentageFromMetadata(metadata)

  return {
    isFinished: metadata?.isFinished ?? false,
    isDownloaded: getIsDownloadedFromMetadata(metadata),
    isDownloading: getIsDownloadingFromMetadata(metadata),
    downloadProgress: metadata?.downloadProgress ?? 0,
    progress: metadata?.playback ?? 0,
    progressPercentage,
    isInProgress: progressPercentage > 0 && metadata?.isFinished !== true,
    duration: metadata?.duration ?? 0,
  }
}
