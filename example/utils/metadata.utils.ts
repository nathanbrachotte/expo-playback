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
  metadata: LocalEpisodeMetadata,
  totalDuration: number,
): number {
  return ((metadata.playback ?? 0) / totalDuration) * 100
}

export function getIsFinishedFromMetadata(
  metadata: LocalEpisodeMetadata,
  progressPercentage: number,
): boolean {
  return metadata.isFinished || progressPercentage >= 95
}

export function getIsDownloadedFromMetadata(metadata: LocalEpisodeMetadata): boolean {
  return metadata.downloadProgress === 100
}

export function getIsDownloadingFromMetadata(metadata: LocalEpisodeMetadata): boolean {
  return (
    metadata.downloadProgress !== null &&
    metadata.downloadProgress !== 0 &&
    metadata.downloadProgress !== 100
  )
}

export function getEpisodeStateFromMetadata(
  metadata: LocalEpisodeMetadata,
  duration: number | null,
): PrettyMetadata {
  if (!duration) {
    console.warn("🚀 ~ Found an episode with duration 0: ", metadata.episodeId)
  }

  const progressPercentage = getProgressPercentageFromMetadata(metadata, duration ?? 0)

  return {
    isFinished: getIsFinishedFromMetadata(metadata, progressPercentage),
    isDownloaded: getIsDownloadedFromMetadata(metadata),
    isDownloading: getIsDownloadingFromMetadata(metadata),
    dowloadProgress: metadata.downloadProgress ?? 0,
    progress: metadata.playback ?? 0,
    progressPercentage,
    isInProgress: progressPercentage > 0 && progressPercentage < 95,
  }
}

export function getEpisodeStateFromMetadataWithoutDuration(
  metadata: LocalEpisodeMetadata,
): Pick<PrettyMetadata, "isDownloaded" | "isDownloading" | "dowloadProgress" | "progress"> {
  return {
    isDownloaded: getIsDownloadedFromMetadata(metadata),
    isDownloading: getIsDownloadingFromMetadata(metadata),
    dowloadProgress: metadata.downloadProgress ?? 0,
    progress: metadata.playback ?? 0,
  }
}
