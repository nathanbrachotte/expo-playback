import { H5, Paragraph } from "tamagui"

import { PURECAST_EMAIL } from "../../utils/constants"
import { PureLayout } from "../Layout"
import { PureYStack } from "../PureStack"

export function ErrorSection() {
  return (
    <PureYStack centered f={1} px="$5">
      <H5>Something went wrong 😥</H5>
      <Paragraph mt="$2" textAlign="center">
        Please try again. If you keep having issues feel free to reach out to {PURECAST_EMAIL}.
      </Paragraph>
    </PureYStack>
  )
}

export function ErrorScreen() {
  return (
    <PureLayout>
      <ErrorSection />
    </PureLayout>
  )
}
