import { useLiveQuery, drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import React from "react";
import { View, Text } from "react-native";

import * as schema from "../db/schema";

const expo = openDatabaseSync("db.db", { enableChangeListener: true }); // <-- enable change listeners
const db = drizzle(expo);

export function DrizzlePlayground() {
  const { data } = useLiveQuery(db.select().from(schema.users));
  console.log("🚀 ~ DrizzlePlayground ~ data:", data);
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>{JSON.stringify(data)}</Text>
    </View>
  );
}
