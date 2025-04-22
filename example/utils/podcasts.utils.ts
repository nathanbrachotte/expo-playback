import { ToLocalEpisodeSchema, ToLocalPodcastSchema } from "../clients/schemas"
import { AppleEpisodeResponse } from "../types/purecast.types"

export function extractAndParseEpisodesFromItunesResponse(data: AppleEpisodeResponse["results"]) {
  return data
    .filter((episode) => episode.wrapperType === "podcastEpisode")
    .map((episode) => ToLocalEpisodeSchema.parse(episode))
}

export function extractAndParsePodcastFromItunesResponse(data: AppleEpisodeResponse["results"]) {
  return ToLocalPodcastSchema.parse(data.find((episode) => episode.wrapperType === "track"))
}

/**
 * Handles all types of missing data and simply return string | undefined
 *
 * Might be dumb but trying to build the app in such way it's easier to add other sources than itunes.
 * Makes building this whole thing harder now though.
 */
export function getAppleIdFromPodcast(podcast: { appleId?: number } | undefined) {
  if (!podcast) {
    return null
  }

  return podcast.appleId?.toString() ?? null
}
