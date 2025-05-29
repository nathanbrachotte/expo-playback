import { Check } from "@tamagui/lucide-icons"
import React, { ComponentProps } from "react"
import { getVariable, getVariableValue, Paragraph } from "tamagui"

import { PureXStack, PureYStack } from "./PureStack"
import { Optional } from "../utils/types.utils"

type BaseTitleProps = {
  children: React.ReactNode
  size?: ComponentProps<typeof Paragraph>["size"]
  numberOfLines?: ComponentProps<typeof Paragraph>["numberOfLines"]
  opacity?: ComponentProps<typeof Paragraph>["opacity"]
}

export function EpisodeTitle({
  title,
  isFinished,
  Component = Paragraph,
  componentProps = {},
}: {
  title: string
  isFinished: Optional<boolean>
  Component: React.ComponentType<BaseTitleProps>
  componentProps?: ComponentProps<typeof Paragraph>
}) {
  const value = getVariable(componentProps.size)
  const checkSize = value ? value * 0.3 : getVariable("$1")

  return (
    <PureXStack jc="flex-start" ai="center" gap="$1">
      {isFinished ? <Check size={checkSize} color="$green9" /> : null}
      <Component opacity={isFinished ? 0.6 : 1} {...componentProps}>
        {title}
      </Component>
    </PureXStack>
  )
}

export function EpisodeDescription({ description }: { description: string }) {
  return (
    <PureYStack flex={1} mt="$2">
      <Paragraph numberOfLines={2} size="$1" lineHeight={16}>
        {description}
      </Paragraph>
    </PureYStack>
  )
}
