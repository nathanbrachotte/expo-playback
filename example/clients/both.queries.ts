import { useGetItunesEpisodeQuery, useGetItunesPodcastQuery } from "./itunes.queries"
import { useGetLocalPodcastQuery, useGetLiveLocalEpisodeQuery } from "./local.queries"

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

export function useGetEpisodeByIdQuery(episodeId: string | null) {
  // This one uses LiveQuery so types are fucked
  const { data: localEpisode, error, updatedAt } = useGetLiveLocalEpisodeQuery({ id: episodeId })
  console.log("🚀 ~ useGetEpisodeByIdQuery ~ localEpisode:", localEpisode)

  //? We only fetch info if the episode is not already there locally
  const isMissingLocally = localEpisode.length !== 1

  const { data: fetchedEpisode, isLoading: isAppleLoading } = useGetItunesEpisodeQuery(
    isMissingLocally ? episodeId : null,
  )
  console.log("🚀 ~ useGetEpisodeByIdQuery ~ fetchedEpisode:", fetchedEpisode)

  const isLoading = isAppleLoading

  const foundEpisode = localEpisode[0] || fetchedEpisode
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
