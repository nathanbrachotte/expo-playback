import { RouteProp } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"

import { SharedEpisodeFields } from "./db"
import { Optional } from "../utils/types"

export type RootStackParamList = {
  Home: undefined
  PodcastSearch: undefined
  Podcast: { id: string }
  Episode: { id: string; episode: SharedEpisodeFields & { podcastTitle?: Optional<string> } }
  DatabaseExplorer: undefined
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">
export type PodcastScreenRouteProp = RouteProp<RootStackParamList, "Podcast">
export type EpisodeScreenRouteProp = RouteProp<RootStackParamList, "Episode">
