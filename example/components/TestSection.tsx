import React from "react"
import { Button, H1, Paragraph, YStack } from "tamagui"

import { useSavePodcastMutation } from "../clients/local.mutations"
import { useGetLiveLocalEpisodeQuery } from "../clients/local.queries"
import { ToLocalPodcastSchema } from "../clients/schemas"

const SHOW_TEST_SECTION = false

export function TestSection() {
  const { data: localEpisode, error, updatedAt } = useGetLiveLocalEpisodeQuery({ id: "1000704249323" })

  const { mutateAsync: savePodcast } = useSavePodcastMutation({
    podcastId: "1019768302",
  })

  if (!SHOW_TEST_SECTION) {
    return null
  }

  return (
    <YStack bg="$red5">
      <H1>Test section</H1>
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
              collectionViewUrl: "https://podcasts.apple.com/de/podcast/floodcast/id1019768302?uo=4",
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
      <Paragraph>Amount result: {JSON.stringify(localEpisode.length, null, 2)}</Paragraph>
      <Paragraph>{JSON.stringify(localEpisode, null, 2)}</Paragraph>
      <Paragraph>{JSON.stringify(error, null, 2)}</Paragraph>
    </YStack>
  )
}
