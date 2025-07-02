import { randomUUID } from "expo-crypto"

export const MISSING_VALUES_EPISODE = {
  // If publishedAt is missing, we use the oldest date possible
  publishedAt: new Date("1970-01-01"),
} as const

export function generateRssId(podcastId: number, rssId: string | null) {
  return `${podcastId.toString()}-${rssId || `generated-${randomUUID()}`}`
}

// Episodes should always have the same id between all users so we use podcastId and publishedAt to generate a unique id
export function generateEpisodeId(podcastId: number, publishedAt: Date, rssId?: string): string {
  if (rssId) {
    return rssId
  }

  const timestamp = publishedAt.getTime()

  return `${podcastId}-${timestamp}`
}
