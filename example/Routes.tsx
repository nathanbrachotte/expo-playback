import { createNativeStackNavigator } from "@react-navigation/native-stack"
import React from "react"

import { Player } from "./components/Player/Player"
import { DatabaseExplorerScreen } from "./screens/DatabaseExplorerScreen"
import { EpisodeScreen } from "./screens/Episode/EpisodeScreen"
import { HomeScreen } from "./screens/HomeScreen"
import { PodcastScreen } from "./screens/PodcastScreen"
import { PodcastSearchScreen } from "./screens/PodcastSearchScreen"
import { SettingsScreen } from "./screens/SettingsScreen"
import { RootStackParamList } from "./types/navigation.types"

const Stack = createNativeStackNavigator<RootStackParamList>()

export function Routes() {
  return (
    <>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PodcastSearch" component={PodcastSearchScreen} />
        <Stack.Screen name="Podcast" component={PodcastScreen} />
        <Stack.Screen name="Episode" component={EpisodeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="DatabaseExplorer" component={DatabaseExplorerScreen} />
      </Stack.Navigator>
      {/* KEEP IT HERE DON?T LISTEN TO ERIK; IN ROUTES IT NEEDS TO BE REINSTANTIATED EVERY TIME */}
      <Player />
    </>
  )
}
