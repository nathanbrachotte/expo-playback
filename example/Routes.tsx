import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"

import { Player } from "./components/Player/Player"
import { TestAreaScreen } from "./components/TestAreaScreen"
import { DatabaseExplorerScreen } from "./screens/DatabaseExplorerScreen"
import { EpisodeScreen } from "./screens/Episode/EpisodeScreen"
import { HomeScreen } from "./screens/HomeScreen"
import { LatestEpisodesScreen } from "./screens/LatestEpisodesScreen"
import { PlaygroundScreen } from "./screens/PlaygroundScreen"
import { PodcastScreen } from "./screens/Podcast/PodcastScreen"
import { PodcastSearchScreen } from "./screens/PodcastSearchScreen"
import { SettingsScreen } from "./screens/SettingsScreen"
import { RootStackParamList } from "./types/navigation.types"
import { DownloadedEpisodesScreen } from "./screens/DownloadedEpisodesScreen"
import { InProgressEpisodesScreen } from "./screens/InProgressEpisodesScreen"

const Stack = createNativeStackNavigator<RootStackParamList>()

export function Routes() {
  return (
    <>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PodcastSearch" component={PodcastSearchScreen} />
        <Stack.Screen name="LatestEpisodes" component={LatestEpisodesScreen} />
        <Stack.Screen name="DownloadedEpisodes" component={DownloadedEpisodesScreen} />
        <Stack.Screen name="InProgressEpisodes" component={InProgressEpisodesScreen} />
        <Stack.Screen name="Podcast" component={PodcastScreen} />
        <Stack.Screen name="Episode" component={EpisodeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="DatabaseExplorer" component={DatabaseExplorerScreen} />
        <Stack.Screen name="TestArea" component={TestAreaScreen} />
        <Stack.Screen name="Playground" component={PlaygroundScreen} />
      </Stack.Navigator>
      {/* KEEP IT HERE DON?T LISTEN TO ERIK; IN ROUTES IT NEEDS TO BE REINSTANTIATED EVERY TIME */}
      <Player />
    </>
  )
}
