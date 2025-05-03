import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({
  path: ".env.local",
})

const env = process.env.ENVIRONMENT

// Helper function to get database ID based on environment
const getDatabaseId = () => {
  switch (env) {
    case "preview":
      return process.env.CLOUDFLARE_DATABASE_ID_PREVIEW!
    case "production":
      return process.env.CLOUDFLARE_DATABASE_ID_PRODUCTION!
    default:
      throw new Error(`Unknown environment: ${env}`)
  }
}

// Helper function to get migrations output directory
const getMigrationsDir = () => {
  switch (env) {
    case "preview":
      return "./src/db/migrations/preview"
    default:
      return "./src/db/migrations/production"
  }
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: getMigrationsDir(),
  dialect: "sqlite",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: getDatabaseId(),
    token: process.env.CLOUDFLARE_API_TOKEN!,
  },
  verbose: true,
  strict: true,
})
