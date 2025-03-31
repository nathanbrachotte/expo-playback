import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { ToastProvider } from "@tamagui/toast"
import { useColorScheme } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { TamaguiProvider } from "tamagui"

import { DatabaseExplorerScreen } from "./screens/DatabaseExplorerScreen"
import { HomeScreen } from "./screens/HomeScreen"
import { PodcastScreen } from "./screens/PodcastScreen"
import { PodcastSearchScreen } from "./screens/PodcastSearchScreen"
// import config from "./tamagui.config"
import config, { tamaguiConfig } from "./tamagui.config"
import { RootStackParamList } from "./types/navigation"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"

const Stack = createNativeStackNavigator<RootStackParamList>()
const queryClient = new QueryClient()

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
          <ToastProvider>
            <QueryClientProvider client={queryClient}>
              <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="PodcastSearch" component={PodcastSearchScreen} />
                <Stack.Screen name="Podcast" component={PodcastScreen} />
                <Stack.Screen name="DatabaseExplorer" component={DatabaseExplorerScreen} />
              </Stack.Navigator>
            </QueryClientProvider>
          </ToastProvider>
        </NavigationContainer>
      </TamaguiProvider>
    </SafeAreaProvider>
  )
}
