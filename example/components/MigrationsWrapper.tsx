import { useToastController } from "@tamagui/toast"
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator"
import React, { PropsWithChildren, useEffect } from "react"

import { db } from "../db/client"
import migrations from "../drizzle/migrations"

export function MigrationsWrapper({ children }: PropsWithChildren) {
  const { success, error } = useMigrations(db, migrations)
  const lastSuccessRef = React.useRef(success)
  console.log("🚀 ~ MigrationsWrapper ~ success:", success)
  console.log("🚀 ~ MigrationsWrapper ~ error:", error)
  const toastController = useToastController()

  useEffect(() => {
    if (error) {
      toastController.show("Failed migration", {
        message: "There were isses doing DB migration. You may have to reset the app.",
        duration: 3000,
      })
    }

    if (!lastSuccessRef.current && success) {
      console.log("🚀 initial SQLite migration successful")

      lastSuccessRef.current = true
    }
  }, [error, success])

  return <>{children}</>
}
