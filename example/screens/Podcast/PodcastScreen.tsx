import { useRoute } from "@react-navigation/native"
import React from "react"

import { RemotePodcastScreen } from "./RemotePodcastScreen"
import { useGetLocalPodcastQuery } from "../../clients/local.queries"
import { ErrorScreen } from "../../components/Sections/Error"
import { LoadingScreen } from "../../components/Sections/Loading"
import { PodcastScreenRouteProp } from "../../types/navigation.types"
import { LocalPodcastScreen } from "./LocalPodcastScreen"

export function PodcastScreen() {
  const route = useRoute<PodcastScreenRouteProp>()

  const { id } = route.params

  const { data: localPodcast, isLoading: isLocalLoading } = useGetLocalPodcastQuery(id ?? null)

  if (isLocalLoading) {
    return <LoadingScreen />
  }

  if (!id) {
    return <ErrorScreen />
  }

  if (localPodcast && !isLocalLoading) {
    return <LocalPodcastScreen id={id} />
  }

  return <RemotePodcastScreen id={id} />
}
