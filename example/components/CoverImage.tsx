import { Image } from "tamagui"

import { PureYStack } from "./PureStack"
import { DEVICE_WIDTH } from "../utils/constants"

export const FULL_PLAYER_IMAGE_SIZE = DEVICE_WIDTH * 0.6

export function CoverImage({
  imageString,
  size = FULL_PLAYER_IMAGE_SIZE,
}: {
  imageString: string | null
  size?: number
}) {
  if (!imageString) {
    return <PureYStack width={size} height={size} borderRadius="$6" bg="$color5" />
  }

  return (
    <Image
      borderRadius="$6"
      source={{ uri: imageString }}
      width={size}
      height={size}
      objectFit="cover"
    />
  )
}
