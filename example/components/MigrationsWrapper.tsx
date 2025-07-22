import { useMigrations } from "drizzle-orm/expo-sqlite/migrator"
import { useDrizzleStudio } from "expo-drizzle-studio-plugin"
import React, { PropsWithChildren, useEffect } from "react"

import { PURE_TOASTS } from "./toasts"
import { db, drizzleClient } from "../db/client"
import migrations from "../drizzle/migrations"
import { useFetchNewEpisodesMutation } from "../clients/rss.queries"

export function MigrationsWrapper({ children }: PropsWithChildren) {
  useDrizzleStudio(db)

  const { success, error } = useMigrations(drizzleClient, migrations)
  const { mutateAsync: fetchNewEpisodes } = useFetchNewEpisodesMutation()

  const lastSuccessRef = React.useRef(success)

  useEffect(() => {
    if (error) {
      PURE_TOASTS.error({
        message: "There were isses doing DB migration. You may have to reset the app.",
      })
    }

    if (!lastSuccessRef.current && success) {
      console.log("🚀 initial SQLite migration successful")
      fetchNewEpisodes()
      lastSuccessRef.current = true
    }
  }, [error, success])

  return <>{children}</>
}
