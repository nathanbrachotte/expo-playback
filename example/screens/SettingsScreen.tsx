import { useNavigation } from "@react-navigation/native"
import { Database, Play, TestTube } from "@tamagui/lucide-icons"
import React from "react"
import { H5 } from "tamagui"

import { PureLayout } from "../components/Layout"
import { PureYStack } from "../components/PureStack"
import { ButtonList } from "../components/buttons"

export function SettingsScreen() {
  const navigation = useNavigation()

  return (
    <PureLayout header={<H5>Settings</H5>}>
      <PureYStack px="$3" gap="$3" mt="$3">
        <ButtonList
          icon={<Database size={20} />}
          text="Database Explorer"
          onPress={() => navigation.navigate("DatabaseExplorer")}
        />
        <ButtonList
          icon={<Play size={20} />}
          text="Playground"
          onPress={() => navigation.navigate("Playground")}
        />
        <ButtonList
          icon={<TestTube size={20} />}
          text="Test Area"
          onPress={() => navigation.navigate("TestArea")}
        />
      </PureYStack>
    </PureLayout>
  )
}
