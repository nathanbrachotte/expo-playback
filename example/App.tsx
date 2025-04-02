import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { PortalProvider } from "@tamagui/portal"
import { ToastProvider, useToastState, Toast } from "@tamagui/toast"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { useColorScheme } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { TamaguiProvider, YStack } from "tamagui"

import { MigrationsWrapper } from "./components/MigrationsWrapper"
import { ToastWrapper } from "./components/ToastWrapper"
import { DatabaseExplorerScreen } from "./screens/DatabaseExplorerScreen"
import { HomeScreen } from "./screens/HomeScreen"
import { PodcastScreen } from "./screens/PodcastScreen"
import { PodcastSearchScreen } from "./screens/PodcastSearchScreen"
// import config from "./tamagui.config"
import config, { tamaguiConfig } from "./tamagui.config"
import { RootStackParamList } from "./types/navigation"

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
        <PortalProvider>
          <ToastProvider>
            <ToastWrapper>
              <MigrationsWrapper>
                <QueryClientProvider client={queryClient}>
                  <NavigationContainer theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                    <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="Home" component={HomeScreen} />
                      <Stack.Screen name="PodcastSearch" component={PodcastSearchScreen} />
                      <Stack.Screen name="Podcast" component={PodcastScreen} />
                      <Stack.Screen name="DatabaseExplorer" component={DatabaseExplorerScreen} />
                    </Stack.Navigator>
                  </NavigationContainer>
                </QueryClientProvider>
              </MigrationsWrapper>
            </ToastWrapper>
          </ToastProvider>
        </PortalProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  )
}
