import { XMLParser } from "fast-xml-parser"
import { z, ZodError } from "zod/v4"
import { FromRSSItemToLocalEpisodeSchema } from "./schemas"

// true or falso or "Yes" or "No". Because why not.
const ExplicitSchema = z.any()
// This is the normal way but some retarded podcasts send back like: ["yes", "yes"]
// @see https://www.ivoox.com/es-patriarcalmente-hablando_fg_f1584817_filtro_1.xml?promotionalCampaign
// .union([z.boolean(), z.string()])
// .optional()
// .transform((val) => {
//   if (typeof val === "boolean") {
//     return val
//   }

//   if (typeof val === "string") {
//     return val.toLowerCase() === "no"
//   }

//   return false
// })

const TitleSchema = z.union([z.string(), z.number()])
// Schema for RSS feed items (episodes)
export const RssItemSchema = z.object({
  "title": TitleSchema,
  "itunes:title": TitleSchema.optional(),
  "pubDate": z.string().optional(),
  "itunes:duration": z.union([z.string(), z.number()]).optional(),
  "enclosure": z
    .object({
      url: z.string(),
      length: z.string(),
      type: z.string(),
    })
    .optional(),
  "guid": z
    .union([
      z.object({
        // Some fuckers like Fest & Flauschig send back a guid with sometimes a UUID and sometimes a number.
        // BECAUSE WHY THE FUCK NOT.
        "#text": z.union([z.string(), z.number()]).optional(),
        "isPermaLink": z.string().optional(),
      }),
      z.string(),
    ])
    .optional(),
  "itunes:explicit": ExplicitSchema.optional(),
  "link": z.string().optional(),
  "itunes:episodeType": z.string().optional(),
  "itunes:season": z.union([z.string(), z.number()]).optional(),
  "itunes:episode": z.union([z.string(), z.number()]).optional(),
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
  "title": TitleSchema,
  "link": z.string().optional(),
  "language": z.string().optional(),
  "copyright": z.string().optional(),
  "itunes:author": z.string().optional(),
  "itunes:subtitle": z.string().optional(),
  "itunes:summary": z.string().optional(),
  "description": z.string().optional(),
  "itunes:explicit": ExplicitSchema,
  "itunes:owner": z
    .object({
      "itunes:name": z.string().optional(),
      "itunes:email": z.string().optional(),
    })
    .optional(),
  "itunes:image": z
    .object({
      href: z.string(),
    })
    .optional(),
  "image": z
    .object({
      url: z.string().optional(),
      link: z.string().optional(),
      title: z.string().optional(),
    })
    .optional(),
  "item": z.unknown(),
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
export const DEBUG_RSS_FEED = false

export function validateRSSEpisodes(data: RssFeed) {
  try {
    const episodes = Array.isArray(data.rss.channel.item)
      ? data.rss.channel.item.map((episode) => {
          if (DEBUG_RSS_FEED) {
            console.log(
              "🚀 ~ ?data.rss.channel.item.map ~ episode:",
              JSON.stringify(episode, null, 2),
            )
          }
          try {
            return FromRSSItemToLocalEpisodeSchema.parse(episode)
          } catch (error) {
            console.error("Error parsing episode:", JSON.stringify(episode, null, 2))
            if (error instanceof ZodError) {
              console.error("ZodError:", z.prettifyError(error))
            }

            throw error
          }
        })
      : [FromRSSItemToLocalEpisodeSchema.parse(data.rss.channel.item)]

    return episodes
  } catch (error) {
    console.error("Error extracting episodes from RSS feed:", error)
    throw error
  }
}

export async function fetchAndValidateRssFeed(feedUrl: string | null): Promise<RssFeed> {
  if (DEBUG_RSS_FEED) {
    console.log("🚀 ~ fetchAndValidateRssFeed ~ feedUrl:", feedUrl)
  }

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
  console.log("🚀 ~ fetchAndValidateRssFeed ~ parsedData:", parsedData)

  try {
    const validatedData = RssFeedSchema.parse(parsedData)
    return validatedData
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("🚀 ~ fetchRssFeed ~ error:", z.prettifyError(error))
    }

    // console.error("🚀 ~ fetchRssFeed ~ feedUrl:", feedUrl)
    // console.log("🚀 ~ fetchRssFeed ~ parsedData:", JSON.stringify(parsedData, null, 2))
    throw new Error(`Failed to parse RSS feed: ${error}`, { cause: error })
  }
}
