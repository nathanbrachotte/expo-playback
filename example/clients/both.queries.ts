import { useGetItunesEpisodeQuery, useGetItunesPodcastQuery } from "./itunes.queries"
import { useGetLocalPodcastQuery, useGetLiveLocalEpisodeQuery } from "./local.queries"

/**
 * Hooks that fetch first from local and then from remote if not found locally
 */
export function useGetPodcastByIdQuery(podcastId: string | null) {
  const { data: localPodcast, isLoading: isLocalLoading } = useGetLocalPodcastQuery(podcastId)

  //? We only fetch info if the episode is not already there locally
  const isMissingLocally = !localPodcast && !isLocalLoading

  const { data: fetchedPodcast, isLoading: isAppleLoading } = useGetItunesPodcastQuery(
    isMissingLocally ? podcastId : null,
  )

  const isLoading = isLocalLoading || isAppleLoading

  const podcast = localPodcast || fetchedPodcast

  return { isLoading, podcast }
}

export function useGetEpisodeByIdQuery({ episodeId, podcastId }: { episodeId: string; podcastId: string }) {
  // This one uses LiveQuery so types are fucked
  const { data: localEpisode, error, updatedAt } = useGetLiveLocalEpisodeQuery({ id: episodeId })

  //? We only fetch info if the episode is not already there locally
  const isMissingLocally = localEpisode.length !== 1

  const {
    data: fetchedEpisode,
    isLoading: isAppleLoading,
    error: appleError,
  } = useGetItunesEpisodeQuery(
    isMissingLocally
      ? { episodeId, podcastId }
      : {
          episodeId: null,
          podcastId: null,
        },
  )

  const isLoading = isAppleLoading

  const foundEpisode = localEpisode[0] || fetchedEpisode
  console.log("🚀 ~ useGetEpisodeByIdQuery ~ fetchedEpisode:", fetchedEpisode)
  console.log("🚀 ~ useGetEpisodeByIdQuery ~ localEpisode:", localEpisode)
  console.log("🚀 ~ useGetEpisodeByIdQuery ~ foundEpisode:", foundEpisode)

  if (!foundEpisode) {
    const error = isLoading ? null : Error("useGetEpisodeByIdQuery - Can't find episode")

    return {
      error,
      isLoading: isAppleLoading,
      episode: null,
      podcast: null,
    }
  }

  return { isLoading, episode: foundEpisode.episode, podcast: foundEpisode.podcast }
}
