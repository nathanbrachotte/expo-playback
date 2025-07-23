import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { desc, sql } from "drizzle-orm"
import { useLiveQuery } from "drizzle-orm/expo-sqlite"
import { eq } from "drizzle-orm"

import { drizzleClient, schema } from "../db/client"
import { episodeMetadatasTable, episodesTable, podcastsTable } from "../db/schema"
import { useEffect, useMemo, useState } from "react"
import {
  addCoreEpisodeMetadataUpdateListener,
  addEpisodeMetadataUpdateDownloadProgressListener,
  addEpisodeMetadataUpdatePlaybackListener,
} from "expo-playback"

export function useLocalPodcastsQuery() {
  return useQuery({
    queryKey: ["savedPodcasts"],
    queryFn: async () => {
      const podcasts = await drizzleClient.select().from(schema.podcastsTable)
      return podcasts
    },
  })
}

export async function getPodcastById(id: string | null) {
  if (!id) {
    return null
  }

  const res = await drizzleClient
    .select()
    .from(schema.podcastsTable)
    .where(sql`id = ${id}`)

  if (res.length === 0) {
    return null
  }

  return res[0]
}

export function useGetLocalPodcastQuery(id: string | null) {
  return useQuery({
    queryKey: ["savedPodcast", id],
    queryFn: () => getPodcastById(id),
    enabled: !!id,
  })
}

async function getEpisodesByPodcastId(podcastId: string | null) {
  if (!podcastId) {
    return null
  }

  const res = await drizzleClient
    .select()
    .from(schema.episodesTable)
    .where(sql`${episodesTable.podcastId} = ${podcastId}`)

  return res
}

async function getEpisodesWithPodcastAndMetadataByPodcastId(podcastId: string | null) {
  if (!podcastId) {
    return null
  }

  const res = await drizzleClient
    .select({
      episode: {
        ...episodesTable,
      },
      podcast: {
        ...podcastsTable,
      },
      episodeMetadata: {
        ...episodeMetadatasTable,
      },
    })
    .from(episodesTable)
    .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
    .leftJoin(episodeMetadatasTable, sql`${episodesTable.id} = ${episodeMetadatasTable.episodeId}`)
    .where(sql`${episodesTable.podcastId} = ${podcastId}`)
    .orderBy(desc(episodesTable.publishedAt))

  return res
}

export function useGetLocalEpisodesWithPodcastAndMetadataByPodcastIdLiveQuery(
  podcastId: string | null,
) {
  return useLiveQuery(
    drizzleClient
      .select({
        episode: {
          ...episodesTable,
        },
        podcast: {
          ...podcastsTable,
        },
        episodeMetadata: {
          ...episodeMetadatasTable,
        },
      })
      .from(episodesTable)
      .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
      .innerJoin(
        episodeMetadatasTable,
        sql`${episodesTable.id} = ${episodeMetadatasTable.episodeId}`,
      )
      .orderBy(desc(episodesTable.publishedAt))
      .where(sql`${episodesTable.podcastId} = ${podcastId}`),
    [podcastId],
  )
}

export function useGetLocalEpisodesByPodcastIdQuery(podcastId: string | null) {
  return useQuery({
    queryKey: ["savedEpisodes", podcastId],
    queryFn: () => getEpisodesWithPodcastAndMetadataByPodcastId(podcastId),
    enabled: !!podcastId,
  })
}

export const episodeWithExtrasByIdDbQuery = (episodeId: string | null) =>
  drizzleClient
    .select({
      episode: {
        ...episodesTable,
      },
      podcast: {
        ...podcastsTable,
      },
      episodeMetadata: {
        ...episodeMetadatasTable,
      },
    })
    .from(episodesTable)
    .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
    .leftJoin(episodeMetadatasTable, sql`${episodesTable.id} = ${episodeMetadatasTable.episodeId}`)
    .where(sql`${episodesTable.id} = ${episodeId}`)

export async function getEpisodeWithPodcastByExternalId(episodeId: string | null) {
  if (!episodeId) {
    return null
  }

  const res = await episodeWithExtrasByIdDbQuery(episodeId)

  if (res.length !== 1) {
    return null
  }

  return res[0]
}

export async function getEpisodeWithPodcastById(episodeId: string | null) {
  if (!episodeId) {
    return null
  }

  const res = await episodeWithExtrasByIdDbQuery(episodeId)

  if (res.length !== 1) {
    return null
  }

  return res[0]
}

export function useGetLiveLocalEpisodeQuery({ id }: { id: string | null }) {
  return useLiveQuery(episodeWithExtrasByIdDbQuery(id), [id])
}

export const episodeMetadataByIdDbQuery = (episodeId: number) =>
  drizzleClient
    .select({
      episodeMetadata: {
        ...episodeMetadatasTable,
      },
    })
    .from(episodeMetadatasTable)
    .where(sql`${episodeMetadatasTable.episodeId} = ${episodeId}`)

export function useGetLiveLocalEpisodeMetadataQuery(
  id: number,
  updateConfig: {
    playback: boolean
    downloadProgress: boolean
  } = {
    playback: false,
    downloadProgress: false,
  },
) {
  const [playback, setPlayback] = useState(0)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const queryClient = useQueryClient()

  useEffect(() => {
    const playbackSubscription = updateConfig.playback
      ? addEpisodeMetadataUpdatePlaybackListener(({ episodeId, playback }) => {
          if (episodeId === id) {
            setPlayback(playback)
          }
        })
      : null
    const downloadProgressSubscription = updateConfig.downloadProgress
      ? addEpisodeMetadataUpdateDownloadProgressListener(({ episodeId, downloadProgress }) => {
          if (episodeId === id) {
            setDownloadProgress(downloadProgress)
          }
        })
      : null
    return () => {
      playbackSubscription?.remove()
      downloadProgressSubscription?.remove()
    }
  }, [updateConfig.playback, updateConfig.downloadProgress, id])

  const { data, refetch, ...rest } = useQuery({
    queryKey: ["episodeMetadata", id],
    queryFn: () => episodeMetadataByIdDbQuery(id),
    enabled: !!id,
  })

  useEffect(() => {
    const coreEpisodeMetadataUpdateSubscription = addCoreEpisodeMetadataUpdateListener(
      ({ episodeId, trigger }) => {
        if (episodeId !== id) return

        if (trigger === "deleted") {
          queryClient.invalidateQueries({ queryKey: ["episodeMetadata", id] })
          return
        }
        refetch()
      },
    )
    return () => {
      coreEpisodeMetadataUpdateSubscription?.remove()
    }
  }, [id])

  useEffect(() => {
    if (!data) {
      setPlayback(0)
      setDownloadProgress(0)
      return
    }
    setPlayback(data?.[0]?.episodeMetadata?.playback ?? 0)
    setDownloadProgress(data?.[0]?.episodeMetadata?.downloadProgress ?? 0)
  }, [data, id])

  const mergedEpisodeMetadata = useMemo(() => {
    const first = data?.[0]

    if (!first) {
      return undefined
    }

    return {
      ...first,
      episodeMetadata: {
        ...first?.episodeMetadata,
        playback,
        downloadProgress,
      },
    }
  }, [data, playback, downloadProgress])

  return {
    data: mergedEpisodeMetadata,
    ...rest,
  }
}

async function getAllEpisodes({ pageParam = 0 }: { pageParam?: number }) {
  const limit = 20
  const offset = pageParam * limit
  const res = await drizzleClient
    .select({
      episode: {
        ...episodesTable,
      },
      podcast: {
        ...podcastsTable,
      },
      episodeMetadata: {
        ...episodeMetadatasTable,
      },
    })
    .from(episodesTable)
    .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
    .leftJoin(episodeMetadatasTable, sql`${episodesTable.id} = ${episodeMetadatasTable.episodeId}`)
    .orderBy(desc(episodesTable.publishedAt))
    .limit(limit)
    .offset(offset)

  return res
}

export function useInfiniteAllEpisodesQuery() {
  return useInfiniteQuery({
    queryKey: ["allEpisodes"],
    queryFn: getAllEpisodes,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If lastPage has less than 20 items, it means there are no more pages
      if (lastPage.length < 20) {
        return undefined
      }
      // Otherwise, increment the page number (which acts as the offset multiplier)
      return allPages.length
    },
  })
}

export function useAllDownloadedEpisodesLiveQuery() {
  return useLiveQuery(
    drizzleClient
      .select({
        episode: {
          ...episodesTable,
        },
        podcast: {
          ...podcastsTable,
        },
        episodeMetadata: {
          ...episodeMetadatasTable,
        },
      })
      .from(episodesTable)
      .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
      .leftJoin(
        episodeMetadatasTable,
        sql`${episodesTable.id} = ${episodeMetadatasTable.episodeId}`,
      )
      .orderBy(desc(episodesTable.publishedAt)),
  )
}

async function getAllDownloadedEpisodes({ pageParam = 0 }: { pageParam?: number }) {
  const limit = 20
  const offset = pageParam * limit
  const res = await drizzleClient
    .select({
      episode: {
        ...episodesTable,
      },
      podcast: {
        ...podcastsTable,
      },
      episodeMetadata: {
        ...episodeMetadatasTable,
      },
    })
    .from(episodesTable)
    .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
    .innerJoin(episodeMetadatasTable, sql`${episodesTable.id} = ${episodeMetadatasTable.episodeId}`)
    .where(sql`${episodeMetadatasTable.downloadProgress} = 100`)
    .orderBy(desc(episodesTable.publishedAt))
    .limit(limit)
    .offset(offset)

  return res
}

export function useAllDownloadedEpisodesQuery() {
  return useInfiniteQuery({
    queryKey: ["allDownloadedEpisodes"],
    queryFn: getAllDownloadedEpisodes,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // Assuming lastPage is an array of episodes
      // If lastPage has less than 20 items, it means there are no more pages
      if (lastPage.length < 20) {
        return undefined
      }
      // Otherwise, increment the page number (which acts as the offset multiplier)
      return allPages.length
    },
  })
}

export const getLatestEpisodeQuery = drizzleClient
  .select({
    episode: episodesTable,
    podcast: podcastsTable,
    episodeMetadata: episodeMetadatasTable,
  })
  .from(episodesTable)
  .leftJoin(podcastsTable, eq(episodesTable.podcastId, podcastsTable.id))
  .leftJoin(episodeMetadatasTable, eq(episodesTable.id, episodeMetadatasTable.episodeId))
  .orderBy(desc(episodesTable.publishedAt))
  .limit(1)

export const useGetLatestEpisodeQuery = () => {
  return useQuery({
    queryKey: ["latestEpisode"],
    queryFn: async () => {
      const result = await getLatestEpisodeQuery
      return result
    },
  })
}

async function getAllInProgressEpisodes({ pageParam = 0 }: { pageParam?: number }) {
  const limit = 20
  const offset = pageParam * limit

  const res = await drizzleClient
    .select({
      episode: {
        ...episodesTable,
      },
      podcast: {
        ...podcastsTable,
      },
      episodeMetadata: {
        ...episodeMetadatasTable,
      },
    })
    .from(episodesTable)
    .innerJoin(podcastsTable, sql`${episodesTable.podcastId} = ${podcastsTable.id}`)
    .innerJoin(episodeMetadatasTable, sql`${episodesTable.id} = ${episodeMetadatasTable.episodeId}`)
    .where(
      // AI Black magic. Don't ask me.
      sql`(${episodeMetadatasTable.isFinished} = false) AND ${episodeMetadatasTable.playback} > 0)`,
    )
    .orderBy(desc(episodesTable.publishedAt))
    .limit(limit)
    .offset(offset)
  return res
}

export function useAllInProgressEpisodesQuery() {
  return useInfiniteQuery({
    queryKey: ["allInProgressEpisodes"],
    queryFn: getAllInProgressEpisodes,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If lastPage has less than 20 items, it means there are no more pages
      if (lastPage.length < 20) {
        return undefined
      }
      // Otherwise, increment the page number (which acts as the offset multiplier)
      return allPages.length
    },
  })
}
