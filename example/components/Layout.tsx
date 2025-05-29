import { useNavigation, useNavigationState } from "@react-navigation/native"
import { ChevronLeft } from "@tamagui/lucide-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Button, AnimatePresence, YStackProps } from "tamagui"

import { PureXStack, PureYStack, PureYStackProps } from "./PureStack"

/**
 * @deprecated Use PLayout.Screen instead
 */
export function PureLayout({
  children,
  header,
  actionSection,
  containerStyle,
}: {
  children: React.ReactNode
  header?: React.ReactNode
  actionSection?: React.ReactNode
  containerStyle?: PureYStackProps
}) {
  const insets = useSafeAreaInsets()
  const navigation = useNavigation()
  // const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const isFirstScreen = useNavigationState((state) => state?.routes.length <= 1)

  return (
    // SafeAreaView is not working, so we need to use YStack to get the insets, see: https://reactnative.dev/docs/safeareaview
    <PureYStack bg="$background" flex={1} pt={insets.top} pl={insets.left} pr={insets.right}>
      <PureXStack justifyContent="space-between" alignItems="center" px="$3" py="$2">
        <PureXStack flex={0.5} justifyContent="flex-start" minWidth={40}>
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

const Screen = PureLayout

const Container = ({ children, ...props }: { children: React.ReactNode } & YStackProps) => {
  return (
    <PureYStack flex={1} px="$2" {...props}>
      {children}
    </PureYStack>
  )
}

export const PLayout = {
  Screen,
  Container,
}
