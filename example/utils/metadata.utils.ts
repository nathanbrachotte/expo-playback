import { LocalEpisodeMetadata } from "../types/db.types"

export type PrettyMetadata = {
  isFinished: boolean
  isDownloaded: boolean
  isDownloading: boolean
  progress: number
  dowloadProgress: number
  isInProgress: boolean
}

export function getIsFinishedFromMetadata(metadata: LocalEpisodeMetadata): boolean {
  return metadata.isFinished || (metadata.playback ?? 0) > 95
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
export function getEpisodeStateFromMetadata(metadata: LocalEpisodeMetadata): PrettyMetadata {
  return {
    isFinished: getIsFinishedFromMetadata(metadata),
    isDownloaded: getIsDownloadedFromMetadata(metadata),
    isDownloading: getIsDownloadingFromMetadata(metadata),
    dowloadProgress: metadata.downloadProgress ?? 0,
    // TODO: How to get percentage?
    progress: metadata.playback ?? 0,
    isInProgress: metadata.isFinished === null && metadata.downloadProgress !== null,
  }
}
