import { PodcastSearchResult, PodcastSearchResponse } from "../types/podcast"

const ITUNES_API_BASE_URL = "https://itunes.apple.com"

export async function searchPodcasts(query: string): Promise<PodcastSearchResponse> {
  const encodedQuery = encodeURIComponent(query.trim())
  const response = await fetch(`${ITUNES_API_BASE_URL}/search?media=podcast&term=${encodedQuery}&country=DE`)

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json()
}

export async function getPodcastDetails(id: string): Promise<PodcastSearchResult> {
  const response = await fetch(`${ITUNES_API_BASE_URL}/lookup?id=${id}&country=DE`)
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  const data = await response.json()
  if (!data.results?.[0]) {
    throw new Error("Podcast not found")
  }

  return data.results[0]
}
