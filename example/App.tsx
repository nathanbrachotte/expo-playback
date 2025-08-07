import { Toasts } from "@backpackapp-io/react-native-toast"
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { PortalProvider } from "@tamagui/portal"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { useColorScheme } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
// TODO: Install
// import { getLocales } from "react-native-localize"
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
import { TamaguiProvider, Theme } from "tamagui"

import { Routes } from "./Routes"
import { MigrationsWrapper } from "./components/MigrationsWrapper"
import { I18nProvider } from "./providers/LangProvider"
import { PlayerProvider } from "./providers/PlayerProvider"
// import config from "./tamagui.config"
import { tamaguiConfig } from "./tamagui.config"
import { PostHogProvider } from "posthog-react-native"

const queryClient = new QueryClient({})

const ToastProvider = () => {
  const insets = useSafeAreaInsets()
  return <Toasts extraInsets={{ bottom: insets.bottom }} />
}

export default function App() {
  const colorScheme = useColorScheme()

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PlayerProvider>
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
                    <I18nProvider
                      language={
                        // getLocales()[0].languageTag
                        "en"
                      }
                    >
                      <NavigationContainer
                        theme={colorScheme === "dark" ? DarkTheme : DefaultTheme}
                      >
                        <PostHogProvider
                          apiKey="phc_ku6c5WzjqoLheLR4FDAjo0hI1sJgDaVgsIO6lNAzKDi"
                          options={{
                            host: "https://eu.i.posthog.com",
                            enableSessionReplay: true,
                            captureAppLifecycleEvents: true,
                          }}
                          autocapture={{
                            captureScreens: false, // Screen events are handled differently for react-native-navigation
                            captureTouches: true,
                          }}
                        >
                          <Routes />
                        </PostHogProvider>
                      </NavigationContainer>
                    </I18nProvider>

                    <ToastProvider />
                  </MigrationsWrapper>
                </PortalProvider>
              </Theme>
            </TamaguiProvider>
          </GestureHandlerRootView>
        </PlayerProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  )
}
