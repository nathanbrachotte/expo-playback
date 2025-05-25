import { Button, ButtonProps, Paragraph } from "tamagui"

import { PureXStack } from "./PureStack"
import React, { ComponentProps } from "react"

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

export function GhostButton({
  Icon,
  onPress,
  showBg,
  ...props
}: {
  Icon: ComponentProps<typeof Button>["icon"]
  showBg?: boolean
  onPress: () => void
} & ButtonProps) {
  return (
    <Button
      icon={Icon}
      onPress={onPress}
      // disabled={isPlayed}
      circular
      size="$3"
      bg="transparent"
      {...props}
    />
  )
}
