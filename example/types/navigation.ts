import { NativeStackNavigationProp } from "@react-navigation/native-stack"

export type RootStackParamList = {
  Home: undefined
  PodcastSearch: undefined
  Podcast: { id: string }
  DatabaseExplorer: undefined
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">
