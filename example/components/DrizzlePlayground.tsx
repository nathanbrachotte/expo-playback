import { useLiveQuery, drizzle } from "drizzle-orm/expo-sqlite"
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator"
import * as FileSystem from "expo-file-system"
import { openDatabaseSync } from "expo-sqlite"
import React from "react"
import { View, Text, Button } from "react-native"

import * as schema from "../db/schema"
import migrations from "../drizzle/migrations"

const dbPath = FileSystem.documentDirectory

const expo = openDatabaseSync(
  "purecast_main_db.sqlite",
  {
    enableChangeListener: true,
  },
  // @TODO handle this properly
  dbPath!,
)

const db = drizzle(expo)

export function DrizzlePlayground() {
  const { data } = useLiveQuery(db.select().from(schema.podcastsTable))

  const addUser = async () => {
    await db
      .insert(schema.podcastsTable)
      .values({
        title: "John Doe" + Math.random() * 100,
        appleId: Math.random() * 100,
      })
      .then((res) => {
        console.log("🚀 ~ addUser ~ res:", res)
      })
      .catch((error) => {
        console.log("🚀 ~ addUser ~ error:", error)
      })
  }

  const { success, error } = useMigrations(db, migrations)

  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    )
  }
  if (!success) {
    return (
      <View>
        <Text>Migration is in progress...</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{JSON.stringify(data)}</Text>
      <Button title="Add User" onPress={addUser} />
    </View>
  )
}
