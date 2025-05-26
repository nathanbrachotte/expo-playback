import { H3 } from "tamagui"

import { useLocalPodcastsQuery } from "../clients/local.queries"
import { EpisodesFlatlist } from "../components/EpisodesFlatlist"
import { PureLayout } from "../components/Layout"
import { PureSection } from "../components/Sections/PureSection"

export function LatestEpisodesScreen() {
  const { data: podcastList } = useLocalPodcastsQuery()

  if (podcastList?.length === 0) {
    return null
  }

  return (
    <PureLayout header={<H3>Latest episodes</H3>}>
      <PureSection.Wrapper flex={1}>
        <EpisodesFlatlist />
      </PureSection.Wrapper>
    </PureLayout>
  )
}
