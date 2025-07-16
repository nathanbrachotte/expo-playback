import React from "react"
import { PureXStack } from "./PureStack"

export type ProgressBarProps = {
  value: number
  animated?: boolean
  height?: number
  backgroundColor?: string
  progressColor?: string
}

export function PureProgressBar({
  value,
  animated = false,
  height = 4,
  backgroundColor,
  progressColor,
}: ProgressBarProps) {
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <PureXStack
      w="100%"
      h={height}
      bg={backgroundColor || "$color1"}
      br={height / 2}
      overflow="hidden"
    >
      <PureXStack
        h="100%"
        w={`${clampedValue}%`}
        bg={progressColor || "$color10"}
        br={height / 2}
        animation={animated ? "quick" : undefined}
      />
    </PureXStack>
  )
}
