import { drizzle } from "drizzle-orm/expo-sqlite";
import * as FileSystem from "expo-file-system";
import { openDatabaseSync } from "expo-sqlite";

import * as schema from "../db/schema";

// For it to string since we have a check below
export const DB_PATH = FileSystem.documentDirectory!;
export const DB_NAME = "purecast_main_db.sqlite";

if (!DB_PATH) {
  throw new Error("DB Path not found");
}

export const expo = openDatabaseSync(
  DB_NAME,
  {
    enableChangeListener: true,
  },
  DB_PATH
);

export const db = drizzle(expo);
export { schema };
