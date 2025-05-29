import { Spinner } from "tamagui"

import { PureLayout } from "../Layout"
import { PureYStack } from "../PureStack"

export function LoadingSection({ children }: { children?: React.ReactNode }) {
  return (
    <PureYStack f={1} centered>
      {children}
      <Spinner size="large" />
    </PureYStack>
  )
}

export function LoadingScreen() {
  return (
    <PureLayout>
      <PureYStack f={1} centered>
        <Spinner />
      </PureYStack>
    </PureLayout>
  )
}
