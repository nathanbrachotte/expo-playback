import { PODCASTS_SEARCH_RESPONSE_MOCK } from "../mocks/podcasts.mock"
import { PodcastSearchResponse } from "../types/podcast"

const ITUNES_API_BASE_URL = "https://itunes.apple.com"
const TEST_MODE = true

// https://itunes.apple.com/search?media=podcast&term=fest%20und%20flauschig&country=DE
export async function fetchPodcast(query: string): Promise<PodcastSearchResponse> {
  if (TEST_MODE) {
    return PODCASTS_SEARCH_RESPONSE_MOCK
  }

  const encodedQuery = encodeURIComponent(query.trim())
  const response = await fetch(`${ITUNES_API_BASE_URL}/search?media=podcast&term=${encodedQuery}&country=DE`)

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json()
}

// https://itunes.apple.com/lookup?id=1251196416&country=US&media=podcast&entity=podcastEpisode&limit=100
export async function fetchEpisodes(id: string): Promise<unknown> {
  const queryParams = new URLSearchParams({
    id,
    // country: "DE", //?
    media: "podcast",
    entity: "podcastEpisode",
    limit: "100",
  })

  const response = await fetch(`${ITUNES_API_BASE_URL}/lookup?${queryParams.toString()}`)

  console.log("🚀 ~ fetchEpisodes ~ response:", JSON.stringify(response, null, 2))
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json()
}
