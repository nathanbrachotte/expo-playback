import { useNavigation, useRoute } from "@react-navigation/native"
import { ChevronLeft } from "@tamagui/lucide-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Button, YStackProps } from "tamagui"

import { PureXStack, PureYStack, PureYStackProps } from "./PureStack"
import { usePostHog } from "posthog-react-native"

function PureLayout({
  children,
  header,
  actionSection,
  containerStyle,
  showBackButton = "auto",
}: {
  children: React.ReactNode
  header?: React.ReactNode
  actionSection?: React.ReactNode
  containerStyle?: PureYStackProps
  showBackButton?: boolean | "auto"
}) {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  const route = useRoute()
  const posthog = usePostHog()

  posthog.screen(route.name, {
    ...route.params,
  })

  // Use React Navigation's built-in canGoBack() method for better reliability
  const shouldShowBackButton = showBackButton === "auto" ? navigation.canGoBack() : showBackButton

  return (
    // SafeAreaView is not working, so we need to use YStack to get the insets, see: https://reactnative.dev/docs/safeareaview
    <PureYStack bg="$background" flex={1} pt={insets.top} pl={insets.left} pr={insets.right}>
      <PureXStack justifyContent="space-between" alignItems="center" px="$3" py="$2">
        <PureXStack flex={0.5} justifyContent="flex-start" minWidth={40}>
          {shouldShowBackButton && (
            <Button
              size="$3"
              icon={<ChevronLeft size={20} />}
              onPress={() => navigation.goBack()}
            />
          )}
        </PureXStack>

        <PureXStack flex={2} justifyContent="center" alignItems="center">
          {header}
        </PureXStack>

        <PureXStack flex={0.5} justifyContent="flex-end" minWidth={40}>
          {actionSection}
        </PureXStack>
      </PureXStack>

      <PureYStack flex={1} {...containerStyle}>
        {children}
      </PureYStack>
    </PureYStack>
  )
}

const Container = ({ children, ...props }: { children: React.ReactNode } & YStackProps) => {
  return (
    <PureYStack flex={1} px="$2" {...props}>
      {children}
    </PureYStack>
  )
}

export const PLayout = {
  Screen: PureLayout,
  Container,
}
