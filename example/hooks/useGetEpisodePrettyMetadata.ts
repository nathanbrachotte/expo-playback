import { useGetLiveLocalEpisodeMetadataQuery } from "../clients/local.queries"
import { getPrettyMetadata } from "../utils/metadata.utils"

export function useGetEpisodePrettyMetadata(
  episodeId: number,
  // Whether we should listen to updates for these values
  updateConfig: {
    playback: boolean
    downloadProgress: boolean
  },
) {
  const { data: metadata } = useGetLiveLocalEpisodeMetadataQuery(episodeId, {
    playback: updateConfig.playback,
    downloadProgress: updateConfig.downloadProgress,
  })

  return getPrettyMetadata(metadata?.episodeMetadata)
}
