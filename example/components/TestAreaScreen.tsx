import React from "react"
import { Button, H2, Heading, Paragraph } from "tamagui"

import { PureLayout } from "./Layout"
import { PureYStack } from "./PureStack"
import { useSavePodcastMutation } from "../clients/local.mutations"
import {
  useAllDownloadedEpisodesQuery,
  useAllEpisodesQuery,
  useGetLiveLocalEpisodeQuery,
  useLocalPodcastsQuery,
} from "../clients/local.queries"
import { ToLocalPodcastSchema } from "../clients/schemas"
import { usePlayerContext } from "../providers/PlayerProvider"

export function TestAreaScreen() {
  const {
    data: localEpisode,
    error,
    updatedAt,
  } = useGetLiveLocalEpisodeQuery({ id: "1000704249323" })
  const { data: episodesWithPodcastsAndMetadata } = useAllDownloadedEpisodesQuery()
  const { data: allEpisodes } = useAllEpisodesQuery()
  const { activeEpisode, setActiveEpisodeId } = usePlayerContext()
  const { data: podcastList } = useLocalPodcastsQuery()

  const { mutateAsync: savePodcast } = useSavePodcastMutation({
    podcastId: "1019768302",
  })

  return (
    <PureLayout header={<Heading>Test Area</Heading>}>
      <Paragraph>Podcasts: {podcastList?.length}</Paragraph>
      <Paragraph>Episodes: {episodesWithPodcastsAndMetadata?.pages.flat().length}</Paragraph>
      <Paragraph>All episodes: {allEpisodes?.length}</Paragraph>
      <Paragraph>Amount result: {JSON.stringify(localEpisode.length, null, 2)}</Paragraph>
      <Paragraph>Local episode by id: {JSON.stringify(localEpisode, null, 2)}</Paragraph>
      <Paragraph>Error: {JSON.stringify(error, null, 2)}</Paragraph>
      <Paragraph>Active episode: {JSON.stringify(activeEpisode, null, 2)}</Paragraph>
      <Paragraph>Updated at: {JSON.stringify(updatedAt, null, 2)}</Paragraph>
      <PureYStack gap="$2" m="$2">
        <Button
          onPress={() =>
            savePodcast({
              podcast: ToLocalPodcastSchema.parse({
                artistName: "FloodCast",
                artworkUrl100:
                  "https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/ee/3e/5b/ee3e5b9c-c278-aadf-89ad-822ba2819da3/mza_3496687179233588433.jpg/100x100bb.jpg",
                artworkUrl30:
                  "https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/ee/3e/5b/ee3e5b9c-c278-aadf-89ad-822ba2819da3/mza_3496687179233588433.jpg/30x30bb.jpg",
                artworkUrl60:
                  "https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/ee/3e/5b/ee3e5b9c-c278-aadf-89ad-822ba2819da3/mza_3496687179233588433.jpg/60x60bb.jpg",
                artworkUrl600:
                  "https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/ee/3e/5b/ee3e5b9c-c278-aadf-89ad-822ba2819da3/mza_3496687179233588433.jpg/600x600bb.jpg",
                collectionCensoredName: "FloodCast",
                collectionExplicitness: "notExplicit",
                collectionHdPrice: 0,
                collectionId: 1019768302,
                collectionName: "FloodCast",
                collectionPrice: 0,
                collectionViewUrl:
                  "https://podcasts.apple.com/de/podcast/floodcast/id1019768302?uo=4",
                contentAdvisoryRating: "Clean",
                country: "DEU",
                currency: "EUR",
                feedUrl: "https://feeds.acast.com/public/shows/5ffe3facad3e633276e9ea57",
                genreIds: ["funId"],
                genres: ["fun"],
                kind: "podcast",
                primaryGenreName: "Comedy",
                releaseDate: "2025-03-31T02:01:00Z",
                trackCensoredName: "FloodCast",
                trackCount: 233,
                trackExplicitness: "cleaned",
                trackId: 1019768302,
                trackName: "FloodCast",
                trackPrice: 0,
                trackTimeMillis: 5321,
                trackViewUrl: "https://podcasts.apple.com/de/podcast/floodcast/id1019768302?uo=4",
                wrapperType: "track",
              }),
            })
          }
        >
          Save podcast
        </Button>
        <Button onPress={() => setActiveEpisodeId(191)}>Set active episode</Button>
      </PureYStack>
    </PureLayout>
  )
}
