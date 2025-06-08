import { Check, CheckCircle, CheckCircle2 } from "@tamagui/lucide-icons"
import React, { ComponentProps } from "react"
import { getVariable, Paragraph, useTheme } from "tamagui"
import { formatDate, formatDuration, formatRemainingTime } from "../utils/time.utils"
import { PureXStack, PureYStack } from "./PureStack"
import { Optional } from "../utils/types.utils"
import RenderHtml from "react-native-render-html"
import { useWindowDimensions } from "react-native"
import { cleanHtmlText } from "../utils/text.utils"

type BaseTitleProps = {
  children: React.ReactNode
  size?: ComponentProps<typeof Paragraph>["size"]
  numberOfLines?: ComponentProps<typeof Paragraph>["numberOfLines"]
  opacity?: ComponentProps<typeof Paragraph>["opacity"]
}

export function EpisodeCardTitle({
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
    <PureXStack jc="flex-start" ai="flex-start" gap="$1">
      {isFinished ? <Check size={checkSize} color="$green9" mt="$1.5" /> : null}
      <Component opacity={isFinished ? 0.6 : 1} {...componentProps}>
        {title}
        {title}
      </Component>
    </PureXStack>
  )
}

export function CleanEpisodeDescription({ description }: { description: string }) {
  const cleanedDescription = cleanHtmlText(description)

  return (
    <PureYStack flex={1} mt="$2">
      <Paragraph numberOfLines={2} size="$1" lineHeight={16}>
        {cleanedDescription}
      </Paragraph>
    </PureYStack>
  )
}

export function EpisodeDescriptionHtml({ description }: { description: string }) {
  const { width } = useWindowDimensions()
  const theme = useTheme()

  const source = {
    html: `
      <body style="
        color: ${theme.color.val};
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 16px;
        line-height: 1.5;
      ">
        ${description}
      </body>
    `,
  }

  return <RenderHtml contentWidth={width} source={source} />
}

export function DurationAndDateSection({
  duration,
  date,
  isFinished,
  progress,
  size = "$2",
}: {
  duration: number | null
  date: Date | null
  isFinished?: Optional<boolean>
  progress?: Optional<number>
  size?: ComponentProps<typeof Paragraph>["size"]
}) {
  return (
    <PureXStack jc="flex-start" ai="center">
      <Paragraph size={size}>{date ? formatDate(date) : ""}</Paragraph>
      <Paragraph size={size}>{" • "}</Paragraph>
      <Paragraph size={size}>{duration ? formatDuration(duration) : ""}</Paragraph>
      {isFinished ? (
        <PureXStack centered gap="$1">
          <Paragraph size={size}>{" • "}</Paragraph>
          <PureXStack centered gap="$1.5">
            <Paragraph fontWeight="bold">Finished</Paragraph>
            <CheckCircle2 size={16} color="$green9" />
          </PureXStack>
        </PureXStack>
      ) : null}
      {duration && progress ? (
        <PureXStack centered gap="$1">
          <Paragraph size={size}>{" • "}</Paragraph>
          <Paragraph fontWeight="bold" size={size}>
            {formatRemainingTime(progress, duration)}
          </Paragraph>
        </PureXStack>
      ) : null}
    </PureXStack>
  )
}
