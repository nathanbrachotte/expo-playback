import { ScrollView, styled, YStack } from "tamagui"
import { LinearGradient } from "tamagui/linear-gradient"

import { PLAYER_HEIGHT } from "./Player/Player"

const BaseScrollView = styled(ScrollView, {
  name: "PureScrollView",
  alwaysBounceHorizontal: false,
  alwaysBounceVertical: false,
  contentContainerStyle: {
    flex: 1,
    flexGrow: 1,
  },
  variants: {
    playerAware: {
      true: {
        pb: PLAYER_HEIGHT,
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
  gradientColors?: [string, string]
  playerAware?: boolean
}

export function PureScrollView({
  children,
  gradientHeight = 100,
  gradientColors,
  playerAware = true,
}: PureScrollViewProps) {
  return (
    <YStack flex={1} position="relative">
      <BaseScrollView flex={1} playerAware={playerAware}>
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
