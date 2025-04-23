import { ScrollView, styled, YStack } from "tamagui"
import { LinearGradient } from "tamagui/linear-gradient"

const BaseScrollView = styled(ScrollView, {
  name: "PureScrollView",
  alwaysBounceHorizontal: false,
  alwaysBounceVertical: false,
  contentContainerStyle: {
    flex: 1,
  },
})

type PureScrollViewProps = {
  children: React.ReactNode
  gradientHeight?: number
  gradientColors?: [string, string]
}

export function PureScrollView({
  children,
  gradientHeight = 100,
  gradientColors = ["transparent", "$color1"],
}: PureScrollViewProps) {
  return (
    <YStack flex={1} position="relative">
      <BaseScrollView flex={1} contentContainerStyle={{ flexGrow: 1 }}>
        {children}
      </BaseScrollView>
      <YStack position="absolute" bottom={0} left={0} right={0} height={gradientHeight} pointerEvents="none">
        <LinearGradient colors={gradientColors} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} />
      </YStack>
    </YStack>
  )
}
