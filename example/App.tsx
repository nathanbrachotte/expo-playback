import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useColorScheme } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { TamaguiProvider } from "tamagui"

import { DatabaseExplorerScreen } from "./screens/DatabaseExplorerScreen"
import { HomeScreen } from "./screens/HomeScreen"
import { PodcastResearchScreen } from "./screens/PodcastResearchScreen"
// import config from "./tamagui.config"
import config, { tamaguiConfig } from "./tamagui.config"
import { RootStackParamList } from "./types/navigation"

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const colorScheme = useColorScheme()

  return (
    <SafeAreaProvider>
      <TamaguiProvider
        config={tamaguiConfig}
        // config={config}
        defaultTheme={colorScheme!}
      >
        <NavigationContainer theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="PodcastResearch" component={PodcastResearchScreen} options={{ headerShown: false }} />
            <Stack.Screen name="DatabaseExplorer" component={DatabaseExplorerScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </TamaguiProvider>
    </SafeAreaProvider>
  )
}
