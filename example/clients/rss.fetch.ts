import { XMLParser } from "fast-xml-parser"
import { z } from "zod"

// true or falso or "Yes" or "No". Because why not.
const ExplicitSchema = z.union([
  z.boolean(),
  z.string().transform((val) => val === "Yes"),
  z.string().transform((val) => val === "No"),
])
// Schema for RSS feed items (episodes)
export const RssItemSchema = z.object({
  "title": z.string(),
  "itunes:title": z.string().optional(),
  "pubDate": z.string(),
  "itunes:duration": z.string().optional(),
  "enclosure": z.object({
    url: z.string(),
    length: z.string(),
    type: z.string(),
  }),
  "guid": z.object({
    "#text": z.string().optional(),
    "isPermaLink": z.string().optional(),
  }),

  "itunes:explicit": ExplicitSchema,
  "link": z.string(),
  "itunes:episodeType": z.string().optional(),
  "itunes:season": z.number().optional(),
  "itunes:episode": z.number().optional(),
  "itunes:image": z
    .object({
      href: z.string(),
    })
    .optional(),
  "description": z.string().optional(),
  "itunes:summary": z.string().optional(),
})

// Schema for RSS feed channel (podcast)
const RssChannelSchema = z.object({
  "title": z.string(),
  "link": z.string(),
  "language": z.string(),
  "copyright": z.string(),
  "itunes:author": z.string(),
  "itunes:subtitle": z.string().optional(),
  "itunes:summary": z.string().optional(),
  "description": z.string().optional(),
  "itunes:explicit": ExplicitSchema,
  "itunes:owner": z.object({
    "itunes:name": z.string(),
    "itunes:email": z.string(),
  }),
  "itunes:image": z.object({
    href: z.string(),
  }),
  "image": z.object({
    url: z.string(),
    link: z.string(),
    title: z.string(),
  }),
  "item": z.union([z.array(RssItemSchema), RssItemSchema]),
})

// Schema for the entire RSS feed
const RssFeedSchema = z.object({
  rss: z.object({
    channel: RssChannelSchema,
  }),
})

export type RssFeed = z.infer<typeof RssFeedSchema>
export type RssChannel = z.infer<typeof RssChannelSchema>
export type RssItem = z.infer<typeof RssItemSchema>

export async function fetchRssFeed(feedUrl: string | null): Promise<RssFeed> {
  if (!feedUrl) {
    throw new Error("Feed URL is required")
  }
  let response: any
  try {
    response = await fetch(feedUrl)
  } catch (error) {
    console.error("🚀 ~ fetchRssFeed ~ error:", error)
    throw new Error(`Failed to fetch RSS feed: ${error}`)
  }

  if (response && !response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.statusText}`)
  }

  const xmlText = await response.text()
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
  })

  const parsedData = parser.parse(xmlText)
  try {
    const validatedData = RssFeedSchema.parse(parsedData)
    return validatedData
  } catch (error) {
    console.error("🚀 ~ fetchRssFeed ~ error:", error)
    throw new Error(`Failed to parse RSS feed: ${error}`)
  }
}
