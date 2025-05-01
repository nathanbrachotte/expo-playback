import { ComponentProps } from "react"
import { styled, XStack, YStack } from "tamagui"

const variants = {
  centered: {
    true: {
      jc: "center",
      ai: "center",
    },
  },
} as const

export const PureYStack = styled(YStack, {
  name: "PureYStack",
  variants,
})
export type PureYStackProps = ComponentProps<typeof PureYStack>

export const PureXStack = styled(XStack, {
  name: "PureXStack",
  variants,
})
