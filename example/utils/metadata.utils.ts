import { LocalEpisodeMetadata } from "../types/db.types"

export type PrettyMetadata = {
  isFinished: boolean
  isDownloaded: boolean
  isDownloading: boolean
  progress: number
  progressPercentage: number
  dowloadProgress: number
  isInProgress: boolean
}

export function getProgressPercentageFromMetadata(
  metadata: LocalEpisodeMetadata | undefined,
  totalDuration: number,
): number {
  if (!metadata) {
    return 0
  }

  return ((metadata.playback ?? 0) / totalDuration) * 100
}

export function getIsFinishedFromMetadata(
  metadata: LocalEpisodeMetadata | undefined,
  progressPercentage: number,
): boolean {
  if (!metadata) {
    return false
  }

  return metadata.isFinished || progressPercentage >= 95
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
  duration: number | null,
): PrettyMetadata {
  if (!duration) {
    console.warn("🚀 ~ Found an episode with no duration: ", {
      metadata: JSON.stringify(metadata, null, 2),
      duration,
    })
  }

  const progressPercentage = getProgressPercentageFromMetadata(metadata, duration ?? 0)

  return {
    isFinished: getIsFinishedFromMetadata(metadata, progressPercentage),
    isDownloaded: getIsDownloadedFromMetadata(metadata),
    isDownloading: getIsDownloadingFromMetadata(metadata),
    dowloadProgress: metadata?.downloadProgress ?? 0,
    progress: metadata?.playback ?? 0,
    progressPercentage,
    isInProgress: progressPercentage > 0 && progressPercentage < 95,
  }
}

export function getEpisodeStateFromMetadataWithoutDuration(
  metadata: LocalEpisodeMetadata | undefined,
): Pick<PrettyMetadata, "isDownloaded" | "isDownloading" | "dowloadProgress" | "progress"> {
  return {
    isDownloaded: getIsDownloadedFromMetadata(metadata),
    isDownloading: getIsDownloadingFromMetadata(metadata),
    dowloadProgress: metadata?.downloadProgress ?? 0,
    progress: metadata?.playback ?? 0,
  }
}
