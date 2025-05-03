import { drizzle } from "drizzle-orm/d1"
import { podcastsTable, episodesTable } from "./schema"
import { writeFileSync } from "fs"
import { join } from "path"

const db = drizzle({} as any)

// Generate fixed integer IDs for relationships
const podcastId1 = 1
const podcastId2 = 2

const samplePodcasts = [
  {
    id: podcastId1,
    appleId: 123456789,
    author: "Podcast Author A",
    description: "A great podcast about tech.",
    image600: "https://example.com/podcastA_600.jpg",
    title: "Tech Talks Weekly",
    rssFeedUrl: "https://example.com/podcastA.xml",
    // createdAt/updatedAt will use DEFAULT CURRENT_TIMESTAMP
  },
  {
    id: podcastId2,
    appleId: 987654321,
    author: "Podcast Author B",
    description: "Discussions about modern development.",
    image600: "https://example.com/podcastB_600.jpg",
    title: "Dev Discussions",
    rssFeedUrl: "https://example.com/podcastB.xml",
  },
]

const sampleEpisodes = [
  {
    // id will be auto-generated
    podcastId: podcastId1,
    title: "Episode 1: The Future of JS",
    description: "Exploring the latest trends in JavaScript.",
    publishedAt: new Date("2024-01-10T10:00:00Z"), // Use Date objects
    duration: 3600, // seconds
    shouldDownload: 0, // false
    downloadUrl: "https://example.com/ep1.mp3",
    appleId: "ep1_apple_id",
  },
  {
    podcastId: podcastId1,
    title: "Episode 2: Web Assembly Rising",
    description: "Is Web Assembly the future?",
    publishedAt: new Date("2024-01-17T10:00:00Z"),
    duration: 3750,
    shouldDownload: 1, // true
    downloadUrl: "https://example.com/ep2.mp3",
    appleId: "ep2_apple_id",
  },
  {
    podcastId: podcastId2,
    title: "Episode 1: Backend Choices",
    description: "Comparing different backend technologies.",
    publishedAt: new Date("2024-01-15T12:00:00Z"),
    duration: 4100,
    shouldDownload: 0,
    downloadUrl: "https://example.com/ep3.mp3",
    appleId: "ep3_apple_id",
  },
]

const sqlStatements: string[] = []

// Process deletes - Order matters due to foreign key constraints (delete episodes first)
;[episodesTable, podcastsTable].forEach((table) => {
  const { sql } = db.delete(table).toSQL()
  sqlStatements.push(sql)
})

// Generate insert statements using Drizzle's built-in parameter handling
const generateInsertSql = (table: any, values: any[]) => {
  // Drizzle's toSQL() returns { sql: string, params: unknown[] }
  // For D1 compatibility in a raw SQL seed, we need to manually inline parameters
  const statements = values.map((value) => {
    const { sql, params } = db.insert(table).values(value).toSQL()
    const sqlParts = sql.split("?")

    if (sqlParts.length - 1 !== params.length) {
      console.error(
        `Error: SQL placeholder count (${sqlParts.length - 1}) does not match parameter count (${params.length}) for value:`,
        value,
      )
      console.error(`SQL: ${sql}`)
      return `-- ERROR: Parameter count mismatch for value ${JSON.stringify(value)}`
    }

    let populatedSql = sqlParts[0] // Start with the first part
    for (let i = 0; i < params.length; i++) {
      const param = params[i]
      let formattedParam: string

      if (typeof param === "string") {
        formattedParam = `'${param.replace(/'/g, "''")}'` // Escape single quotes
      } else if (param instanceof Date) {
        // Convert Date to timestamp (seconds for D1 integer)
        formattedParam = `${Math.floor(param.getTime() / 1000)}`
      } else if (typeof param === "boolean") {
        formattedParam = param ? "1" : "0"
      } else if (param === null || param === undefined) {
        formattedParam = "NULL"
      } else {
        formattedParam = `${param}` // Numbers, etc.
      }
      // Append the formatted parameter and the next part of the SQL string
      populatedSql += formattedParam + sqlParts[i + 1]
    }

    return populatedSql
  })
  return statements
}

// Insert podcasts (handle potential auto-increment ID if not provided)
// We provide fixed IDs here for predictable relations
sqlStatements.push(...generateInsertSql(podcastsTable, samplePodcasts))

// Insert episodes
sqlStatements.push(...generateInsertSql(episodesTable, sampleEpisodes))

// Generate final SQL script
const seedSQL = sqlStatements.join(";\n") + ";\n"

// Write to seed.sql in the db directory
const dbDir = join(__dirname) // Assumes script is run from its location
const seedFile = join(dbDir, "seed.sql") // Output to backend/src/db/seed.sql
writeFileSync(seedFile, seedSQL)
console.log("Seed SQL file generated at:", seedFile)
