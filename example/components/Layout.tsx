import { useNavigation, useNavigationState } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { ChevronLeft } from "@tamagui/lucide-icons"
import { SafeAreaView } from "react-native"
import { styled, YStack, XStack, Button, AnimatePresence } from "tamagui"

import { RootStackParamList } from "../types/navigation"
import { PurecastLogo } from "../assets/PurecastLogo"

const CustomSafeAreaView = styled(SafeAreaView, {
  variants: {} as const,
  defaultVariants: {
    bg: "$background",
  },
  flex: 1,
})

export function Layout({
  children,
  header,
  actionSection,
}: {
  children: React.ReactNode
  header?: React.ReactNode
  actionSection?: React.ReactNode
}) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const isFirstScreen = useNavigationState((state) => state?.routes.length <= 1)

  return (
    <CustomSafeAreaView>
      <XStack justifyContent="space-between" alignItems="center" p="$2">
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

      <YStack flex={1} gap="$2" py="$1" px="$2">
        {children}
      </YStack>
    </CustomSafeAreaView>
  )
}
