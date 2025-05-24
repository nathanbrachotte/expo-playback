import { Button, Paragraph } from "tamagui"

import { PureXStack } from "./PureStack"

export function ButtonList({ icon, text, onPress }: { icon: React.ReactNode; text: string; onPress: () => void }) {
  return (
    <Button onPress={onPress} borderRadius="$4" w="100%" justifyContent="flex-start" px="$2" h="$6">
      <PureXStack gap="$3" ai="center" jc="flex-start">
        <PureXStack p="$3" bg="$color2" borderRadius="$4">
          {icon}
        </PureXStack>
        <Paragraph size="$6">{text}</Paragraph>
      </PureXStack>
    </Button>
  )
}
