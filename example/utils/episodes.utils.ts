import { randomUUID } from "expo-crypto"

export function generateRssId(podcastId: number, rssId: string | null) {
  return `${podcastId.toString()}-${rssId || randomUUID()}`
}
