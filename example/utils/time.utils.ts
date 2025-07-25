import { format } from "date-fns"

export function formatDuration(milliseconds: number): string {
  if (milliseconds < 0) {
    milliseconds = 0 // Treat negative durations as 0 for simplicity
  }

  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  } else {
    return `${seconds}s`
  }
}

/**
 * If the date is today, return "Today"
 * If the date is yesterday, return "Yesterday"
 * If the date is in the last 7 days, return the day of the week
 * If the date is more than 7 days ago, return the date in the format "MM/DD/YYYY"
 */
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
    return format(timestamp, "EEEE")
  }

  return format(timestamp, "MMMM d, yyyy")
}

/**
 * Formats the remaining time of an episode in progress
 * @param currentPositionMs - Current position in milliseconds
 * @param durationMs - Total duration in milliseconds
 * @returns Formatted string like "30m left" or "1h 15m left"
 */
export function formatRemainingTime(currentPositionMs: number, durationMs: number): string {
  if (currentPositionMs < 0 || durationMs <= 0) {
    throw new Error("Invalid parameters")
  }

  const remainingMs = Math.max(0, durationMs - currentPositionMs)
  const formattedDuration = formatDuration(remainingMs)
  return `${formattedDuration} left`
}

/**
 * Formats time in seconds to a player-friendly format (M:SS)
 * @param seconds - Time in seconds
 * @returns Formatted string like "2:45" or "12:05"
 */
export function formatPlayerTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

/**
 * Formats the remaining time for player display
 * @param seconds - Time in seconds
 * @returns Formatted string like "-2:45"
 */
export function formatPlayerRemainingTime(seconds: number): string {
  return `-${formatPlayerTime(seconds)}`
}

/**
 * Formats the remaining time for player display based on current position and total duration
 * @param currentPositionSeconds - Current playback position in seconds
 * @param totalDurationSeconds - Total duration in seconds
 * @returns Formatted string like "-2:45"
 */
export function formatPlayerRemainingTimeFromDuration(
  currentPositionSeconds: number,
  totalDurationSeconds: number,
): string {
  const remainingSeconds = Math.max(0, totalDurationSeconds - currentPositionSeconds)
  return formatPlayerRemainingTime(remainingSeconds)
}
