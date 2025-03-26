import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useColorScheme } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { PortalProvider, TamaguiProvider } from "tamagui"

import { DatabaseExplorerScreen } from "./screens/DatabaseExplorerScreen"
import { HomeScreen } from "./screens/HomeScreen"
import { PodcastResearchScreen } from "./screens/PodcastResearchScreen"
import { tamaguiConfig } from "./tamagui.config"
import { RootStackParamList } from "./types/navigation"

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
  const colorScheme = useColorScheme()

  return (
    <SafeAreaProvider>
      <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme!}>
        <PortalProvider shouldAddRootHost>
          <NavigationContainer theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
            <Stack.Navigator initialRouteName="Home">
              <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Purecast" }} />
              <Stack.Screen
                name="PodcastResearch"
                component={PodcastResearchScreen}
                options={{ title: "Search Podcasts" }}
              />
              <Stack.Screen
                name="DatabaseExplorer"
                component={DatabaseExplorerScreen}
                options={{ title: "Database Explorer" }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PortalProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  )
}
