import { ToLocalPodcastSchema } from "./schemas"
import { AppleEpisodeResponse, ApplePodcastResponse } from "../types/purecast.types"
import { EPISODES_RESPONSE_MOCK, PODCASTS_SEARCH_RESPONSE_MOCK } from "../utils/podcasts.mock"

/**
 * This API absolutely sucks but is free.
 * https://gist.github.com/iggym/6023041 For examples on how to use it.
 * https://performance-partners.apple.com/search-api
 *
 */
const ITUNES_API_BASE_URL = "https://itunes.apple.com"
const TEST_MODE = false

// https://itunes.apple.com/search?media=podcast&term=fest%20und%20flauschig&country=DE
export async function searchPodcast(query: string | null) {
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

  const data = (await response.json()) as ApplePodcastResponse
  console.log("🚀 ~ searchPodcast ~ data:", JSON.stringify(data, null, 2))

  return {
    resultCount: data.resultCount,
    results: data.results.map((item) => {
      const parsed = ToLocalPodcastSchema.safeParse(item)

      // Used to detect unexpected shape
      if (!parsed.success) {
        console.log("🚀 ~ searchPodcast ~ parsed:", JSON.stringify(parsed.error, null, 2))
      }

      return parsed.data
    }),
  }
}

// TODO: Not very efficient as we fetch twice, once for podcast and once for episodes. Divide the function into two.
// https://itunes.apple.com/lookup?id=1251196416&country=US&media=podcast&entity=podcastEpisode&limit=100
export async function fetchPodcastAndEpisodes({
  id: podcastId,
  limit = 100,
}: {
  id: string | null
  limit?: number
}): Promise<AppleEpisodeResponse> {
  console.log("🚀 ~ fetchPodcastAndEpisodes ~ id:", { id: podcastId, limit })
  if (!podcastId) {
    return {
      resultCount: 0,
      results: [],
    }
  }

  if (TEST_MODE) {
    return EPISODES_RESPONSE_MOCK
  }

  const queryParams = new URLSearchParams({
    id: podcastId.toString(),
    // country: "DE", //?
    media: "podcast",
    entity: "podcastEpisode", // Remove this and it only returns the podcast
    limit: limit.toString(),
  })
  console.log("🚀 ~ queryParams:", queryParams.toString())

  const response = await fetch(`${ITUNES_API_BASE_URL}/lookup?${queryParams.toString()}`)

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  const data = (await response.json()) as AppleEpisodeResponse
  console.log("🚀 ~ fetchPodcastAndEpisodes ~ data:", JSON.stringify(data, null, 2))

  return data
}
