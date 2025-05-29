import { formatDuration as formatDurationFn } from "@goomba/date-fns"
import { format } from "date-fns"

export function formatDuration(milliseconds: number): string {
  if (milliseconds < 0) {
    milliseconds = 0 // Treat negative durations as 0 for simplicity
  }

  const totalSeconds = Math.floor(milliseconds / 1000)
  const totalMinutesRoundedUp = Math.ceil(totalSeconds / 60)

  if (totalMinutesRoundedUp === 0) {
    // This handles cases from 0ms that round down to 0 minutes.
    return "0m"
  }

  const hours = Math.floor(totalMinutesRoundedUp / 60)
  const minutes = totalMinutesRoundedUp % 60

  // Construct the duration object for @goomba/date-fns
  const durationObject = {
    hours: hours,
    minutes: minutes,
    seconds: 0, // Explicitly set seconds to 0 as we've rounded to minutes
  }

  // Format string to display hours and minutes, e.g., "1h 30m", "0h 5m"
  const formatString = "h 'h' m 'm'"

  const formatted = formatDurationFn(durationObject, formatString)

  return formatted === null ? "0m" : formatted
}

export function formatDate(timestamp: Date) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const lastWeek = new Date(today)
  lastWeek.setDate(lastWeek.getDate() - 7)

  if (timestamp.toDateString() === today.toDateString()) {
    return "Today"
  }

  if (timestamp.toDateString() === yesterday.toDateString()) {
    return "Yesterday"
  }

  if (timestamp.getTime() > lastWeek.getTime()) {
    return timestamp.toLocaleDateString()
  }

  return format(timestamp, "MMMM d, yyyy")
}
