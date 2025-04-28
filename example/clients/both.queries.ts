import { useGetItunesPodcastQuery } from "./itunes.queries"
import { useGetLocalPodcastQuery, useGetLiveLocalEpisodeQuery } from "./local.queries"
import { useGetRssEpisodeQuery } from "./rss.queries"

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

export function useGetEpisodeByIdQuery({ episodeId, feedUrl }: { episodeId: string; feedUrl: string | null }) {
  // This one uses LiveQuery so types are fucked
  const { data: localEpisode, error, updatedAt } = useGetLiveLocalEpisodeQuery({ id: episodeId })

  //? We only fetch info if the episode is not already there locally
  const isMissingLocally = localEpisode.length !== 1

  const { data: fetchedEpisode, isLoading: isRssLoading } = useGetRssEpisodeQuery(
    isMissingLocally && feedUrl
      ? { episodeId, feedUrl }
      : {
          episodeId: null,
          feedUrl: null,
        },
  )

  const isLoading = isRssLoading

  const foundEpisode = localEpisode[0]?.episode || fetchedEpisode

  if (!foundEpisode) {
    const error = isLoading ? null : Error("useGetEpisodeByIdQuery - Can't find episode")

    return {
      error,
      isLoading: isRssLoading,
      episode: null,
    }
  }

  return { isLoading, episode: foundEpisode }
}
