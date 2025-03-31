import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useColorScheme } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { TamaguiProvider } from "tamagui"

import { DatabaseExplorerScreen } from "./screens/DatabaseExplorerScreen"
import { HomeScreen } from "./screens/HomeScreen"
import { PodcastSearchScreen } from "./screens/PodcastSearchScreen"
// import config from "./tamagui.config"
import config, { tamaguiConfig } from "./tamagui.config"
import { RootStackParamList } from "./types/navigation"
import { PodcastScreen } from "./screens/PodcastScreen"

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const colorScheme = useColorScheme()

  return (
    <SafeAreaProvider>
      <TamaguiProvider
        config={tamaguiConfig}
        // config={config}
        // defaultTheme={colorScheme!}
        defaultTheme="dark"
      >
        <NavigationContainer theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PodcastSearch" component={PodcastSearchScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Podcast" component={PodcastScreen} options={{ headerShown: false }} />
            <Stack.Screen name="DatabaseExplorer" component={DatabaseExplorerScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </TamaguiProvider>
    </SafeAreaProvider>
  )
}
