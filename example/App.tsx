import { Toasts } from "@backpackapp-io/react-native-toast"
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { PortalProvider } from "@tamagui/portal"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { useDrizzleStudio } from "expo-drizzle-studio-plugin"
import { useColorScheme } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
// TODO: Install
// import { getLocales } from "react-native-localize"
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
import { TamaguiProvider, Theme } from "tamagui"

import { MigrationsWrapper } from "./components/MigrationsWrapper"
import { db } from "./drizzle"
import { I18nProvider } from "./providers/LangProvider"
import { PlayerProvider } from "./providers/PlayerProvider"
import { DatabaseExplorerScreen } from "./screens/DatabaseExplorerScreen"
import { EpisodeScreen } from "./screens/Episode/EpisodeScreen"
import { HomeScreen } from "./screens/HomeScreen"
import { PodcastScreen } from "./screens/PodcastScreen"
import { PodcastSearchScreen } from "./screens/PodcastSearchScreen"
// import config from "./tamagui.config"
import { SettingsScreen } from "./screens/SettingsScreen"
import { tamaguiConfig } from "./tamagui.config"
import { RootStackParamList } from "./types/navigation.types"

const Stack = createNativeStackNavigator<RootStackParamList>()
const queryClient = new QueryClient()

const ToastProvider = () => {
  const insets = useSafeAreaInsets()
  return <Toasts extraInsets={{ bottom: insets.bottom }} />
}

export default function App() {
  const colorScheme = useColorScheme()
  useDrizzleStudio(db)

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView
        style={{
          flex: 1,
        }}
      >
        <TamaguiProvider
          config={tamaguiConfig}
          // config={config}
          // defaultTheme={colorScheme!}
          defaultTheme="dark"
        >
          <Theme name="blue">
            <PortalProvider>
              <MigrationsWrapper>
                <QueryClientProvider client={queryClient}>
                  <PlayerProvider>
                    <I18nProvider
                      language={
                        // getLocales()[0].languageTag
                        "en"
                      }
                    >
                      <NavigationContainer theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
                        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                          <Stack.Screen name="Home" component={HomeScreen} />
                          <Stack.Screen name="PodcastSearch" component={PodcastSearchScreen} />
                          <Stack.Screen name="Podcast" component={PodcastScreen} />
                          <Stack.Screen name="Episode" component={EpisodeScreen} />
                          <Stack.Screen name="Settings" component={SettingsScreen} />
                          <Stack.Screen name="DatabaseExplorer" component={DatabaseExplorerScreen} />
                        </Stack.Navigator>
                      </NavigationContainer>
                    </I18nProvider>
                  </PlayerProvider>
                  <ToastProvider />
                </QueryClientProvider>
              </MigrationsWrapper>
            </PortalProvider>
          </Theme>
        </TamaguiProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
