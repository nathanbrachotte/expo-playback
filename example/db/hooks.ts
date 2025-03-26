import { useLiveQuery } from "drizzle-orm/expo-sqlite"
import { AnySQLiteSelect } from "drizzle-orm/sqlite-core"
import { SQLiteRelationalQuery } from "drizzle-orm/sqlite-core/query-builders/query"
import { addSqLiteTableUpdatedListener } from "expo-playback"
import { useEffect, useState } from "react"

export const useNativeSaveLiveQuery = <
  T extends Pick<AnySQLiteSelect, "_" | "then"> | SQLiteRelationalQuery<"sync", unknown>,
>(
  query: T,
  tableNames: string[],
  deps?: unknown[],
) => {
  const [tableUpdateEnforcer, setTableUpdateEnforcer] = useState({})
  const { data, ...rest } = useLiveQuery(query, [...(deps ? deps : []), tableUpdateEnforcer])

  useEffect(() => {
    if (!tableNames) return

    // Subscribe to native module events
    const subscription = addSqLiteTableUpdatedListener(({ table }) => {
      if (!tableNames.includes(table)) return
      setTableUpdateEnforcer({})
    })

    return subscription.remove
  }, [tableNames])

  return { data, ...rest }
}
