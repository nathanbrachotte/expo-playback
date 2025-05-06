import { useNavigation } from "@react-navigation/native"
import React from "react"
import { Button, H5 } from "tamagui"

import { PureLayout } from "../components/Layout"
import { PureYStack } from "../components/PureStack"

export function SettingsScreen() {
  const navigation = useNavigation()

  return (
    <PureLayout header={<H5>Settings</H5>}>
      <PureYStack px="$3" gap="$3" mt="$3">
        <Button size="$3" onPress={() => navigation.navigate("DatabaseExplorer")}>
          Database Explorer
        </Button>
      </PureYStack>
    </PureLayout>
  )
}
