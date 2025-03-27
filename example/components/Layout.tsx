import { SafeAreaView } from "react-native"
import { YStack } from "tamagui"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack flex={1} gap="$4" p="$4">
        {children}
      </YStack>
    </SafeAreaView>
  )
}
