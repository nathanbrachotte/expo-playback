import { PODCASTS_SEARCH_RESPONSE_MOCK } from "../utils/podcasts.mock"
import { AppleEpisodeResponse, ApplePodcastResponse } from "../utils/podcasts.types"

const ITUNES_API_BASE_URL = "https://itunes.apple.com"
const TEST_MODE = false

// https://itunes.apple.com/search?media=podcast&term=fest%20und%20flauschig&country=DE
export async function fetchPodcast(query: string | null): Promise<ApplePodcastResponse> {
  if (!query) {
    return {
      resultCount: 0,
      results: [],
    }
  }

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

// TODO: Not very efficient as we fetch twice, once for podcast and once for episodes. Divide the function into two.
// https://itunes.apple.com/lookup?id=1251196416&country=US&media=podcast&entity=podcastEpisode&limit=100
export async function fetchPodcastAndEpisodes(id: string | null): Promise<AppleEpisodeResponse> {
  if (!id) {
    return {
      resultCount: 0,
      results: [],
    }
  }

  const queryParams = new URLSearchParams({
    id: id.toString(),
    // country: "DE", //?
    media: "podcast",
    entity: "podcastEpisode",
    limit: "3",
  })

  const response = await fetch(`${ITUNES_API_BASE_URL}/lookup?${queryParams.toString()}`)

  console.log("🚀 ~ fetchEpisodes ~ response:", JSON.stringify(response, null, 2))
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  return response.json()
}

// TODO: build this
export async function fetchSingleEpisode() {}
