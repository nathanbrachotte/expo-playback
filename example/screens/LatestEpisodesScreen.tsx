import { useLocalPodcastsQuery } from "../clients/local.queries"
import { AllEpisodesList } from "../components/AllEpisodesSection"
import { PureLayout } from "../components/Layout"
import { PureSection } from "../components/Sections/PureSection"

export function LatestEpisodesScreen() {
  const { data: podcastList } = useLocalPodcastsQuery()

  if (podcastList?.length === 0) {
    return null
  }

  return (
    <PureLayout>
      <PureSection.Wrapper>
        <PureSection.Title>Latest episodes</PureSection.Title>
        <AllEpisodesList />
      </PureSection.Wrapper>
    </PureLayout>
  )
}
