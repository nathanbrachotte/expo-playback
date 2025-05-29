import { Button } from "tamagui"
import { Play, SkipBack, SkipForward } from "@tamagui/lucide-icons"

export function PlayerPlayButton() {
  return <Button icon={<Play size={16} />} onPress={() => {}} />
}

export function PlayerSkipBackButton() {
  return <Button icon={<SkipBack size={16} />} onPress={() => {}} />
}

export function PlayerSkipForwardButton() {
  return <Button icon={<SkipForward size={16} />} onPress={() => {}} />
}
