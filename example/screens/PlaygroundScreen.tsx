import { Button, H1, H2, H3, H4, H5, H6, Paragraph } from "tamagui"

import { PureLayout } from "../components/Layout"
import { PureScrollView } from "../components/PureScrollview"
import { PureXStack, PureYStack } from "../components/PureStack"
import { Minus, Plus } from "@tamagui/lucide-icons"
import { GhostButton } from "../components/buttons"

export function PlaygroundScreen() {
  return (
    <PureLayout header={<H5>Playground</H5>}>
      <PureScrollView>
        <PureYStack gap="$2">
          <H1>This is a Header 1 (size="$1")</H1>
          <H2>This is a Header 2 (size="$2")</H2>
          <H3>This is a Header 3 (size="$3")</H3>
          <H4>This is a Header 4 (size="$4")</H4>
          <H5>This is a Header 5 (size="$5")</H5>
          <H6>This is a Header 6 (size="$6")</H6>
          <Paragraph size="$2">This is a Paragraph (size="$2")</Paragraph>
          <Paragraph size="$3">This is a Paragraph (size="$3")</Paragraph>
          <Paragraph size="$4">This is a Paragraph (size="$4")</Paragraph>
          <Paragraph>This is a Paragraph (default)</Paragraph>
          <Paragraph size="$5">This is a Paragraph (size="$5")</Paragraph>
          <Paragraph size="$6">This is a Paragraph (size="$6")</Paragraph>
          <Paragraph size="$7">This is a Paragraph (size="$7")</Paragraph>
          <Button size="$2">This is a Button (size="$2")</Button>
          <Button variant="outlined" size="$2">
            This is a Button (size="$2" variant="outlined")
          </Button>
          <Button size="$3">This is a Button (size="$3")</Button>
          <Button size="$4">This is a Button (size="$4")</Button>
          <Button icon={Plus}>This is a Button (icon=Plus)</Button>
          <Button>This is a Button (default)</Button>
          <Button size="$5">This is a Button (size="$5")</Button>
          <Button size="$6">This is a Button (size="$6")</Button>
          <Button size="$7">This is a Button (size="$7")</Button>
          <Button size="$8">This is a Button (size="$8")</Button>
          <PureXStack gap="$2">
            <GhostButton Icon={Plus} onPress={() => {}} showBg />
            <GhostButton Icon={Minus} onPress={() => {}} />
          </PureXStack>
        </PureYStack>
      </PureScrollView>
    </PureLayout>
  )
}
