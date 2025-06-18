import { useQuery } from "@tanstack/react-query"

import { validateRSSEpisodes, fetchAndValidateRssFeed } from "./rss.fetch"
import type { RssFeed } from "./rss.fetch"

export function useGetRssEpisodesQuery(feedUrl: string | null) {
  return useQuery({
    queryKey: ["rssEpisodes", feedUrl],
    queryFn: () => fetchAndValidateRssFeed(feedUrl),
    select: (data: RssFeed) => validateRSSEpisodes(data),
    enabled: !!feedUrl,
  })
}

export function useGetRssEpisodeQuery({
  feedUrl,
  episodeId,
}: {
  feedUrl: string | null
  episodeId: string | null
}) {
  return useQuery({
    queryKey: ["rssEpisode", feedUrl, episodeId],
    queryFn: () => fetchAndValidateRssFeed(feedUrl),
    select: (data: RssFeed) => {
      const episode = validateRSSEpisodes(data).find((episode) => episode.rssId === episodeId)

      if (!episode) {
        return null
      }
      return episode
    },
    enabled: !!feedUrl && !!episodeId,
  })
}
