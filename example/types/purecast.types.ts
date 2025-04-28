import { EPISODES_RESPONSE_MOCK, PODCASTS_SEARCH_RESPONSE_MOCK } from "../clients/itunes.mock"

export interface SearchResult {
  id: string
  title: string
  author: string
  artworkUrl100?: string
}

export type ApplePodcastResponse = typeof PODCASTS_SEARCH_RESPONSE_MOCK
export type ApplePodcast = (typeof PODCASTS_SEARCH_RESPONSE_MOCK.results)[number]

export type AppleEpisodeResponse = typeof EPISODES_RESPONSE_MOCK
export type AppleEpisode = (typeof EPISODES_RESPONSE_MOCK.results)[number]
