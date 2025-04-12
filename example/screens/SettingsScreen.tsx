import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Button, Paragraph } from "tamagui"

import { PureLayout } from "../components/Layout"

export function SettingsScreen() {
  const navigation = useNavigation()

  return (
    <PureLayout header={<Paragraph>Settings</Paragraph>}>
      <Button size="$3" onPress={() => navigation.navigate("DatabaseExplorer")}>
        Database Explorer
      </Button>
    </PureLayout>
  )
}
