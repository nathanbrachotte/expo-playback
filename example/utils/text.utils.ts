/**
 * Cleans HTML tags and special characters from text while preserving line breaks
 * @param text - The text to clean
 * @returns The cleaned text with HTML tags removed, special characters replaced, and line breaks preserved
 */
export function cleanHtmlText(text: string): string {
  if (!text) return ""

  // Replace common HTML entities
  const decodedText = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&hellip;/g, "...")
    .replace(/&copy;/g, "©")
    .replace(/&reg;/g, "®")
    .replace(/&trade;/g, "™")

  // First, convert <br> and <br/> tags to newlines
  const withLineBreaks = decodedText
    .replace(/<br\s*\/?>/gi, "\n")
    // Convert <p> tags to double newlines (paragraph breaks)
    .replace(/<\/p>/gi, "\n\n")
    // Remove opening <p> tags
    .replace(/<p[^>]*>/gi, "")

  // Remove remaining HTML tags
  const withoutTags = withLineBreaks.replace(/<[^>]*>/g, " ")

  // Clean up whitespace while preserving intentional line breaks
  return withoutTags
    .replace(/[ \t]+/g, " ") // Replace multiple spaces/tabs with single space
    .replace(/\n\s+/g, "\n") // Remove leading spaces after newlines
    .replace(/\s+\n/g, "\n") // Remove trailing spaces before newlines
    .replace(/\n{3,}/g, "\n\n") // Replace 3 or more newlines with just 2
    .trim() // Remove leading/trailing whitespace
}
