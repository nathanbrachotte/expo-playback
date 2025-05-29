import { getToken, getVariable, H3, styled, YStack } from "tamagui"

export const SECTION_PADDING = "$2" as const
export const SECTION_PADDING_VALUE = getVariable(SECTION_PADDING)

console.log("🚀 ~ SECTION_PADDING_VALUE:", SECTION_PADDING_VALUE)

const Wrapper = styled(YStack, {
  variants: {} as const,
  defaultVariants: {},
  px: SECTION_PADDING,
  mt: "$3",
})

const Title = styled(H3, {
  mb: "$1",
  ml: SECTION_PADDING,
})

export const PureSection = {
  Wrapper,
  Title,
}
