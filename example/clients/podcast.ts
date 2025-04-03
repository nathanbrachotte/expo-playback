import { PODCASTS_SEARCH_RESPONSE_MOCK } from "../mocks/podcasts.mock"
import { PodcastSearchResult, PodcastSearchResponse } from "../types/podcast"

// https://itunes.apple.com/search?media=podcast&term=fest%20und%20flauschig&country=DE
const ITUNES_API_BASE_URL = "https://itunes.apple.com"
const TEST_MODE = true

export async function searchPodcasts(query: string): Promise<PodcastSearchResponse> {
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

/*
async function fetchPodcastDetails() {
      try {
        const response = await fetch(`https://itunes.apple.com/lookup?id=${id}&country=DE`)
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        if (data && data.results && data.results[0]) {
          const podcastData = data.results[0]
          setPodcast({
            title: podcastData.trackName || podcastData.collectionName,
            author: podcastData.artistName,
            description: podcastData.description || "No description available",
            artworkUrl100: podcastData.artworkUrl100,
            artworkUrl600: podcastData.artworkUrl600,
            feedUrl: podcastData.feedUrl,
            primaryGenreName: podcastData.primaryGenreName,
            trackCount: podcastData.trackCount,
            releaseDate: podcastData.releaseDate,
            contentAdvisoryRating: podcastData.contentAdvisoryRating,
          })
        } else {
          throw new Error("Podcast not found")
        }
      } catch (error) {
        console.error("Failed to fetch podcast details:", error)
        setError("Failed to load podcast details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    */
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
