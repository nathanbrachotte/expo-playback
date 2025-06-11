import { Button } from "tamagui"
import { RotateCcw } from "@tamagui/lucide-icons"
import { PureXStack } from "../PureStack"
import { PlayButton } from "../buttons"
import { usePlayerContext } from "../../providers/PlayerProvider"

export function PlayerSkipBackButton({ size }: { size: string }) {
  return <Button icon={RotateCcw} size={size} onPress={() => {}} circular />
}

export function PlayerSkipForwardButton({ size }: { size: string }) {
  return <Button icon={RotateCcw} rotateY="180deg" size={size} onPress={() => {}} circular />
}

export function SmallPlayerSection() {
  const { activeEpisode } = usePlayerContext()
  return (
    <PureXStack gap="$2" centered width="30%">
      <PlayerSkipBackButton size="$4" />
      <PlayButton episodeId={activeEpisode?.episode?.id} size="$5" />
      <PlayerSkipForwardButton size="$4" />
    </PureXStack>
  )
}

export function LargePlayerSection() {
  const { activeEpisode } = usePlayerContext()
  return (
    <PureXStack gap="$3" centered>
      <PlayerSkipBackButton size="$5" />
      <PlayButton episodeId={activeEpisode?.episode?.id} size="$6" />
      <PlayerSkipForwardButton size="$5" />
    </PureXStack>
  )
}
