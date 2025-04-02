import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { PortalProvider } from "@tamagui/portal"
import { ToastProvider, useToastState, Toast } from "@tamagui/toast"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { useColorScheme } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { TamaguiProvider, YStack } from "tamagui"

import { MigrationsWrapper } from "./components/MigrationsWrapper"
import { DatabaseExplorerScreen } from "./screens/DatabaseExplorerScreen"
import { HomeScreen } from "./screens/HomeScreen"
import { PodcastScreen } from "./screens/PodcastScreen"
import { PodcastSearchScreen } from "./screens/PodcastSearchScreen"
// import config from "./tamagui.config"
import config, { tamaguiConfig } from "./tamagui.config"
import { RootStackParamList } from "./types/navigation"

const Stack = createNativeStackNavigator<RootStackParamList>()
const queryClient = new QueryClient()

const SuccessToast = () => {
  const currentToast = useToastState()

  if (!currentToast || currentToast.isHandledNatively) return null
  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
      exitStyle={{ opacity: 0, scale: 1, y: -20 }}
      y={0}
      opacity={1}
      scale={1}
      animation="quick"
      viewportName={currentToast.viewportName}
    >
      <YStack>
        <Toast.Title>{currentToast.title}</Toast.Title>
        {!!currentToast.message && <Toast.Description>{currentToast.message}</Toast.Description>}
      </YStack>
    </Toast>
  )
}

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
            <MigrationsWrapper>
              <QueryClientProvider client={queryClient}>
                <NavigationContainer theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                  <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Home" component={HomeScreen} />
                    <Stack.Screen name="PodcastSearch" component={PodcastSearchScreen} />
                    <Stack.Screen name="Podcast" component={PodcastScreen} />
                    <Stack.Screen name="DatabaseExplorer" component={DatabaseExplorerScreen} />
                  </Stack.Navigator>
                  <SuccessToast />
                </NavigationContainer>
              </QueryClientProvider>
            </MigrationsWrapper>
          </ToastProvider>
        </PortalProvider>
      </TamaguiProvider>
    </SafeAreaProvider>
  )
}
