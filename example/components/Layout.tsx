import { useNavigation, useNavigationState } from "@react-navigation/native"
import { ChevronLeft } from "@tamagui/lucide-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { YStack, XStack, Button, AnimatePresence } from "tamagui"

export function PureLayout({
  children,
  header,
  actionSection,
}: {
  children: React.ReactNode
  header?: React.ReactNode
  actionSection?: React.ReactNode
  // wrapperStyle?: ComponentProps<typeof YStack>
}) {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  // const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const isFirstScreen = useNavigationState((state) => state?.routes.length <= 1)

  return (
    // SafeAreaView is not working, so we need to use YStack to get the insets, see: https://reactnative.dev/docs/safeareaview
    <YStack bg="$background" flex={1} pt={insets.top} pb={insets.bottom} pl={insets.left} pr={insets.right}>
      <XStack justifyContent="space-between" alignItems="center" px="$3" py="$2">
        <XStack flex={0.5} justifyContent="flex-start" minWidth={40}>
          <AnimatePresence>
            {!isFirstScreen && (
              <Button
                size="$3"
                icon={<ChevronLeft size={20} />}
                onPress={() => navigation.goBack()}
                animation="quick"
                enterStyle={{ opacity: 0 }}
                exitStyle={{ opacity: 0 }}
                opacity={1}
              />
            )}
          </AnimatePresence>
        </XStack>

        <XStack flex={2} justifyContent="center" alignItems="center">
          {header}
        </XStack>

        <XStack flex={0.5} justifyContent="flex-end" minWidth={40}>
          {actionSection}
        </XStack>
      </XStack>

      <YStack flex={1} gap="$2">
        {children}
      </YStack>
    </YStack>
  )
}
