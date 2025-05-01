import { Image } from "tamagui"

import { PureYStack } from "./PureStack"
import { DEVICE_WIDTH } from "../utils/constants"
import { getImageFromEntity } from "../utils/image.utils"
import { Optional } from "../utils/types.utils"

export const FULL_PLAYER_IMAGE_SIZE = DEVICE_WIDTH * 0.8

export function CoverImage({
  entity,
  size = FULL_PLAYER_IMAGE_SIZE,
}: {
  entity: {
    image30: Optional<string>
    image60: Optional<string>
    image100: Optional<string>
    image600: Optional<string>
  }
  size?: number
}) {
  const image = getImageFromEntity(entity, "600")

  if (!image) {
    return <PureYStack width={size} height={size} borderRadius="$6" />
  }

  return <Image borderRadius="$6" source={{ uri: image }} width={size} height={size} objectFit="cover" />
}
