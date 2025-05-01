import { ScrollView, ScrollViewProps, styled, YStack } from "tamagui"
import { LinearGradient } from "tamagui/linear-gradient"

import { PLAYER_HEIGHT } from "./Player/Player"

export const BaseScrollView = styled(ScrollView, {
  name: "BaseScrollView",
  alwaysBounceHorizontal: false,
  alwaysBounceVertical: false,
  flex: 1,
  contentContainerStyle: {
    flexGrow: 1,
  },
  variants: {
    playerAware: {
      true: {
        contentContainerStyle: {
          pb: PLAYER_HEIGHT,
        },
      },
      false: {
        pb: 0,
      },
    },
  },
  defaultVariants: {
    playerAware: true,
  },
})

type PureScrollViewProps = {
  children: React.ReactNode
  gradientHeight?: number
  height?: number
  gradientColors?: [string, string]
  playerAware?: boolean
  scrollViewProps?: ScrollViewProps
}

export function PureScrollView({
  children,
  gradientHeight = 100,
  height = 100,
  gradientColors,
  playerAware = true,
  scrollViewProps,
}: PureScrollViewProps) {
  return (
    <YStack flex={1} position="relative" height={height}>
      <BaseScrollView playerAware={playerAware} {...scrollViewProps}>
        {children}
      </BaseScrollView>
      <YStack position="absolute" bottom={0} left={0} right={0} height={gradientHeight} pointerEvents="none">
        <LinearGradient
          colors={gradientColors || ["transparent", "$background"]}
          style={{ flex: 1 }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </YStack>
    </YStack>
  )
}
