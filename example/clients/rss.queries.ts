import { useQuery } from "@tanstack/react-query"

import { fetchRssFeed } from "./rss.fetch"
import type { RssFeed } from "./rss.fetch"
import { ToEpisodeFromRSSSchema } from "./schemas"

export function extractEpisodesFromRssFeed(data: RssFeed) {
  const episodes = Array.isArray(data.rss.channel.item)
    ? data.rss.channel.item.map((episode) => ToEpisodeFromRSSSchema.parse(episode))
    : [ToEpisodeFromRSSSchema.parse(data.rss.channel.item)]

  return episodes
}

export function useGetRssEpisodesQuery(feedUrl: string | null) {
  return useQuery({
    queryKey: ["rssEpisodes", feedUrl],
    queryFn: () => fetchRssFeed(feedUrl),
    select: (data: RssFeed) => extractEpisodesFromRssFeed(data),
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
    queryFn: () => fetchRssFeed(feedUrl),
    select: (data: RssFeed) => {
      const episode = extractEpisodesFromRssFeed(data).find(
        (episode) => episode.rssId === episodeId,
      )

      if (!episode) {
        return null
      }
      return episode
    },
    enabled: !!feedUrl && !!episodeId,
  })
}
