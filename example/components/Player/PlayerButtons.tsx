import { Button } from "tamagui"
import { RotateCcw } from "@tamagui/lucide-icons"
import { PureXStack } from "../PureStack"
import { PlayButton } from "../buttons"

export function PlayerSkipBackButton({ size }: { size: string }) {
  return <Button icon={RotateCcw} size={size} onPress={() => {}} circular />
}

export function PlayerSkipForwardButton({ size }: { size: string }) {
  return <Button icon={RotateCcw} rotateY="180deg" size={size} onPress={() => {}} circular />
}

export function SmallPlayerSection() {
  return (
    <PureXStack gap="$2" centered width="30%">
      <PlayerSkipBackButton size="$4" />
      <PlayButton episodeId={1} size="$5" />
      <PlayerSkipForwardButton size="$4" />
    </PureXStack>
  )
}

export function LargePlayerSection() {
  return (
    <PureXStack gap="$3" centered>
      <PlayerSkipBackButton size="$5" />
      <PlayButton episodeId={1} size="$6" />
      <PlayerSkipForwardButton size="$5" />
    </PureXStack>
  )
}
