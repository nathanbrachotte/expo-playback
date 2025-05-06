import { randomUUID } from "expo-crypto"

import { formatDate, formatDuration } from "./time.utils"
import { LocalEpisode } from "../types/db.types"

export function generateRssId(podcastId: number, rssId: string | null) {
  return `${podcastId.toString()}-${rssId || randomUUID()}`
}

export function getDurationAndDateFromEpisode(episode: LocalEpisode) {
  const publishedAtString = formatDate(episode.publishedAt)
  const durationString = episode.duration ? formatDuration(episode.duration) : null

  return {
    duration: episode.duration,
    date: episode.publishedAt,
    label: `${publishedAtString} ${durationString ? `• ${durationString}` : ""}`,
  }
}
