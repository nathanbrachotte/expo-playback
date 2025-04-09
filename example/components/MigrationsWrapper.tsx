import { useMigrations } from "drizzle-orm/expo-sqlite/migrator"
import React, { PropsWithChildren, useEffect } from "react"

import { PURE_TOASTS } from "./toasts"
import { db } from "../db/client"
import migrations from "../drizzle/migrations"

export function MigrationsWrapper({ children }: PropsWithChildren) {
  const { success, error } = useMigrations(db, migrations)
  const lastSuccessRef = React.useRef(success)

  useEffect(() => {
    if (error) {
      PURE_TOASTS.error({
        message: "There were isses doing DB migration. You may have to reset the app.",
      })
    }

    if (!lastSuccessRef.current && success) {
      console.log("🚀 initial SQLite migration successful")

      lastSuccessRef.current = true
    }
  }, [error, success])

  return <>{children}</>
}
