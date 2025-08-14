import { eq, desc } from "drizzle-orm"
import { drizzle } from "drizzle-orm/d1"
import { Hono } from "hono"

import { podcastsTable, episodesTable } from "./db/schema"

export type Env = {
  DB_PROD: D1Database
}

const app = new Hono<{ Bindings: Env }>().basePath("/api/v1")

// Helper to parse integer param
const parseIntParam = (param: string | undefined): number | undefined => {
  if (param === undefined) return undefined
  const parsed = parseInt(param, 10)
  return isNaN(parsed) ? undefined : parsed
}

// Health check endpoint
app.get("/", (c) => {
  return c.text("Hello Hono! Purecast API is running.")
})

// --- Podcast Endpoints ---

// GET all podcasts
app.get("/podcasts", async (c) => {
  const db = drizzle(c.env.DB_PROD)
  console.log("🚀 ~ app.get ~ db:", db)
  try {
    const result = await db
      .select()
      .from(podcastsTable)
      .orderBy(desc(podcastsTable.createdAt))
      .all()
    console.log("🚀 ~ app.get ~ result:", result)
    return c.json(result)
  } catch (error: any) {
    console.error("Error fetching podcasts:", error)
    return c.json({ error: "Failed to fetch podcasts" }, 500)
  }
})

// GET podcast by ID
app.get("/podcasts/:id", async (c) => {
  const db = drizzle(c.env.DB_PROD)
  const id = parseIntParam(c.req.param("id"))

  if (id === undefined) {
    return c.json({ error: "Invalid podcast ID" }, 400)
  }

  try {
    const result = await db.select().from(podcastsTable).where(eq(podcastsTable.id, id)).get()
    if (!result) {
      return c.json({ error: "Podcast not found" }, 404)
    }
    return c.json(result)
  } catch (error: any) {
    console.error(`Error fetching podcast ${id}:`, error)
    return c.json({ error: "Failed to fetch podcast" }, 500)
  }
})

// --- Episode Endpoints ---

// GET all episodes (consider pagination for large datasets)
app.get("/episodes", async (c) => {
  const db = drizzle(c.env.DB_PROD)
  // Optional: Filter by podcastId if provided as query param
  const podcastIdQuery = c.req.query("podcastId")
  const podcastId = parseIntParam(podcastIdQuery)

  try {
    // Build the query with conditional where clause
    const query = db
      .select()
      .from(episodesTable)
      .where(podcastId !== undefined ? eq(episodesTable.podcastId, podcastId) : undefined)
      .orderBy(desc(episodesTable.publishedAt))

    const result = await query.all()
    return c.json(result)
  } catch (error: any) {
    console.error("Error fetching episodes:", error)
    return c.json({ error: "Failed to fetch episodes" }, 500)
  }
})

// GET episode by ID
app.get("/episodes/:id", async (c) => {
  const db = drizzle(c.env.DB_PROD)
  const id = parseIntParam(c.req.param("id"))

  if (id === undefined) {
    return c.json({ error: "Invalid episode ID" }, 400)
  }

  try {
    const result = await db.select().from(episodesTable).where(eq(episodesTable.id, id)).get()
    if (!result) {
      return c.json({ error: "Episode not found" }, 404)
    }
    return c.json(result)
  } catch (error: any) {
    console.error(`Error fetching episode ${id}:`, error)
    return c.json({ error: "Failed to fetch episode" }, 500)
  }
})

// GET episodes for a specific podcast
app.get("/podcasts/:podcastId/episodes", async (c) => {
  const db = drizzle(c.env.DB_PROD)
  const podcastId = parseIntParam(c.req.param("podcastId"))

  if (podcastId === undefined) {
    return c.json({ error: "Invalid podcast ID" }, 400)
  }

  try {
    // Check if podcast exists (optional, but good practice)
    const podcastExists = await db
      .select({ id: podcastsTable.id })
      .from(podcastsTable)
      .where(eq(podcastsTable.id, podcastId))
      .get()
    if (!podcastExists) {
      return c.json({ error: "Podcast not found" }, 404)
    }

    const result = await db
      .select()
      .from(episodesTable)
      .where(eq(episodesTable.podcastId, podcastId))
      .orderBy(desc(episodesTable.publishedAt))
      .all()

    return c.json(result)
  } catch (error: any) {
    console.error(`Error fetching episodes for podcast ${podcastId}:`, error)
    return c.json({ error: "Failed to fetch episodes for the specified podcast" }, 500)
  }
})

export default app
