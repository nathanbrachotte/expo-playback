import { Paragraph } from "tamagui"
import { PureXStack } from "./PureStack"
import { formatDate, formatDuration, formatRemainingTime } from "../utils/time.utils"
import { Optional } from "../utils/types.utils"
import { ComponentProps } from "react"

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
    <PureXStack>
      <Paragraph size={size}>{date ? formatDate(date) : ""}</Paragraph>
      <Paragraph size={size}>{" • "}</Paragraph>
      <Paragraph size={size}>{duration ? formatDuration(duration) : ""}</Paragraph>
      {isFinished ? (
        <PureXStack centered gap="$1">
          <Paragraph size={size}>{" • "}</Paragraph>
          <Paragraph fontWeight="bold" size={size}>
            Finished
          </Paragraph>
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
