import { Toasts } from "@backpackapp-io/react-native-toast"
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native"
import { PortalProvider } from "@tamagui/portal"
import { QueryClientProvider, QueryClient } from "@tanstack/react-query"
import { useDrizzleStudio } from "expo-drizzle-studio-plugin"
import { useColorScheme } from "react-native"
import { GestureHandlerRootView } from "react-native-gesture-handler"
// TODO: Install
// import { getLocales } from "react-native-localize"
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context"
import { TamaguiProvider, Theme } from "tamagui"

import { Routes } from "./Routes"
import { MigrationsWrapper } from "./components/MigrationsWrapper"
import { db } from "./drizzle"
import { I18nProvider } from "./providers/LangProvider"
import { PlayerProvider } from "./providers/PlayerProvider"
// import config from "./tamagui.config"
import { tamaguiConfig } from "./tamagui.config"

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
                        <Routes />
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
