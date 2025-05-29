import { Paragraph } from "tamagui"
import { PureXStack } from "./PureStack"
import { formatDate, formatDuration } from "../utils/time.utils"
import { Optional } from "../utils/types.utils"

/**
 * If the date is today, return "Today"
 * If the date is yesterday, return "Yesterday"
 * If the date is in the last 7 days, return the day of the week
 * If the date is more than 7 days ago, return the date in the format "MM/DD/YYYY"
 */
export function ReleaseDate({ date }: { date: Date | null }) {
  if (!date) {
    return null
  }

  return <Paragraph>{formatDate(date)}</Paragraph>
}

export function Duration({ duration }: { duration: number | null }) {
  if (!duration) {
    return null
  }

  return <Paragraph>{formatDuration(duration)}</Paragraph>
}

export function DurationAndDateSection({
  duration,
  date,
  isFinished,
}: {
  duration: number | null
  date: Date | null
  isFinished?: Optional<boolean>
}) {
  return (
    <PureXStack>
      <ReleaseDate date={date} />
      <Paragraph>{" - "}</Paragraph>
      <Duration duration={duration} />
      {isFinished ? (
        <PureXStack centered gap="$1">
          <Paragraph>{" - "}</Paragraph>
          <Paragraph color="white" fontWeight="bold">
            Finished
          </Paragraph>
        </PureXStack>
      ) : null}
    </PureXStack>
  )
}
