import { H3, styled, YStack } from "tamagui"

const Wrapper = styled(YStack, {
  variants: {} as const,
  defaultVariants: {},
  px: "$2",
  mt: "$3",
})

const Title = styled(H3, {
  mb: "$1",
})

export const PureSection = {
  Wrapper,
  Title,
}
