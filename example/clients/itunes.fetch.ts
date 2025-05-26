import { ToLocalPodcastSchema } from "./schemas"
import { AppleEpisodeResponse, ApplePodcastResponse } from "../types/purecast.types"
import { EPISODES_RESPONSE_MOCK, PODCASTS_SEARCH_RESPONSE_MOCK } from "./itunes.mock"
import { BooleanFilter } from "../utils/types.utils"

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
    return {
      ...PODCASTS_SEARCH_RESPONSE_MOCK,
      results: PODCASTS_SEARCH_RESPONSE_MOCK.results.map((item) => {
        return ToLocalPodcastSchema.parse(item)
      }),
    }
  }
  const encodedQuery = encodeURIComponent(query.trim())
  const queryParams = new URLSearchParams({
    media: "podcast",
    term: encodedQuery,
    country: "FR",
  })
  const response = await fetch(`${ITUNES_API_BASE_URL}/search?${queryParams.toString()}`)

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  const data = (await response.json()) as ApplePodcastResponse

  return {
    resultCount: data.resultCount,
    results: data.results
      .map((item) => {
        // console.log("🚀 ~ results:data.results.map ~ item:", JSON.stringify(item, null, 2))
        const parsed = ToLocalPodcastSchema.safeParse(item)

        // Used to detect unexpected shape
        if (!parsed.success) {
          console.log("🚀 ~ searchPodcast ~ parsed:", JSON.stringify(parsed.error, null, 2))
          return null
        }

        return parsed.data
      })
      .filter(BooleanFilter),
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
    country: "DE", //?
    media: "podcast",
    entity: "podcastEpisode", // Remove this and it only returns the podcast
    limit: limit.toString(),
  })

  const response = await fetch(`${ITUNES_API_BASE_URL}/lookup?${queryParams.toString()}`)

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  const data = (await response.json()) as AppleEpisodeResponse

  return data
}
