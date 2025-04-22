import { ScrollView, styled } from "tamagui"

export const PureScrollView = styled(ScrollView, {
  name: "PureScrollView",
  alwaysBounceHorizontal: false,
  alwaysBounceVertical: false,
  contentContainerStyle: {
    flex: 1,
  },
})
