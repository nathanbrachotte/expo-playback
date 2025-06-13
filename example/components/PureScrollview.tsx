import { ScrollView, ScrollViewProps, styled, YStack } from "tamagui"

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
  playerAware?: boolean
  scrollViewProps?: ScrollViewProps
}

export function PureScrollView({
  children,
  playerAware = true,
  scrollViewProps,
}: PureScrollViewProps) {
  return (
    <YStack flex={1} position="relative">
      <BaseScrollView playerAware={playerAware} {...scrollViewProps}>
        {children}
      </BaseScrollView>
    </YStack>
  )
}
