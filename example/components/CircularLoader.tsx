import { GetProps } from "@tamagui/core"
import { Stack } from "tamagui"
import React from "react"
import Svg, { Circle } from "react-native-svg"

type CircularLoaderProps = {
  /**
   * Progress value from 0 to 100
   */
  progress: number
  size?: number
  color?: string
  backgroundColor?: string
  strokeWidth?: number
} & Omit<GetProps<typeof Stack>, "size">

export function CircularLoader({
  progress,
  size = 20,
  color = "#000000",
  backgroundColor,
  strokeWidth = 3,
  ...props
}: CircularLoaderProps) {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100)

  // Calculate circle properties
  const center = size / 2
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Calculate stroke dash based on progress
  // Start from top (12 o'clock) by rotating -90 degrees
  const progressStroke = (circumference * normalizedProgress) / 100

  return (
    <Stack {...props}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${progressStroke} ${circumference}`}
          strokeDashoffset={0}
          transform={`rotate(-90 ${center} ${center})`}
          strokeLinecap="round"
        />
      </Svg>
    </Stack>
  )
}
