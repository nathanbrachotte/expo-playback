import { Spinner } from "tamagui"

import { PureLayout } from "../Layout"

export function LoadingSection() {
  return (
    <PureLayout>
      <Spinner />
    </PureLayout>
  )
}
