import { Spinner } from "tamagui"

import { PLayout } from "../Layout"
import { PureYStack } from "../PureStack"

export function LoadingSection({ children }: { children?: React.ReactNode }) {
  return (
    <PureYStack f={1} centered>
      {children}
      <Spinner size="large" />
    </PureYStack>
  )
}

export function LoadingScreen({ header }: { header?: React.ReactNode }) {
  return (
    <PLayout.Screen header={header}>
      <PureYStack f={1} centered>
        <Spinner />
      </PureYStack>
    </PLayout.Screen>
  )
}
