import { deleteDatabaseSync } from "expo-sqlite"

import { drizzleClient, DB_NAME, DB_PATH } from "./client"

export const resetDatabase = async () => {
  try {
    // Ensure database is closed before deletion
    try {
      await drizzleClient.$client.closeAsync()
    } catch (closeError) {
      console.warn("Warning: Error while closing database:", closeError)
      // Continue with deletion even if close fails
    }

    // Delete the existing database
    deleteDatabaseSync(DB_NAME, DB_PATH)
  } catch (error) {
    console.error("Error resetting database:", error)
    throw error
  }
}
