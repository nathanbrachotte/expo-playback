import { Paragraph } from "tamagui"
import { H3 } from "tamagui"
import { PureYStack } from "../PureStack"

export function EmptySection({
  header,
  description,
}: {
  header?: React.ReactNode
  description?: React.ReactNode
}) {
  return (
    <PureYStack centered f={1} px="$5">
      {header ? <H3>{header}</H3> : <H3>Nothing here yet 😥</H3>}
      {description ? (
        <Paragraph>{description}</Paragraph>
      ) : (
        <Paragraph>Add some podcasts to get started.</Paragraph>
      )}
    </PureYStack>
  )
}
