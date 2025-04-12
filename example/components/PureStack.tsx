import { styled, XStack, YStack } from "tamagui"

export const PureYStack = styled(YStack, {
  name: "PureYStack",
  variants: {
    centered: {
      true: {
        jc: "center",
        ai: "center",
      },
    },
  } as const,
})

export const PureXStack = styled(XStack, {
  name: "PureXStack",
  variants: {
    centered: {
      true: {
        jc: "center",
        ai: "center",
      },
    },
  } as const,
})
