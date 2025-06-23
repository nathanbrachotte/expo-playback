import { drizzle } from "drizzle-orm/expo-sqlite"
import * as FileSystem from "expo-file-system"
import { openDatabaseSync } from "expo-sqlite"

import * as schema from "../db/schema"
import { Logger } from "drizzle-orm"
export { schema }

// Force it to string since we have a check below
export const DB_PATH = FileSystem.documentDirectory!
export const DB_NAME = "purecast_main_db.sqlite"
export const DB_LOGS_ON =
  process.env.EXPO_PUBLIC_DB_DEBUG_LOGS_ENABLED === "true" && process.env.NODE_ENV === "development"

if (!DB_PATH) {
  throw new Error("DB Path not found")
}

export const customLogger: Logger = {
  logQuery(query: string, params: unknown[]) {
    console.info("🔍 SQL Query:", query)
    console.info("📊 Parameters:", params)
    console.info("--------------------------------")
  },
}

export const db = openDatabaseSync(
  DB_NAME,
  {
    enableChangeListener: true,
  },
  DB_PATH,
)

export const drizzleClient = drizzle(db, {
  logger: DB_LOGS_ON ? customLogger : false,
})
