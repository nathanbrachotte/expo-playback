import { Optional } from "./types.utils"

const PRIORITY_SIZES = ["30", "60", "100", "600"] as const

export function getImageFromEntity(
  entity: {
    image30: Optional<string>
    image60: Optional<string>
    image100: Optional<string>
    image600: Optional<string>
  },
  prioSize: (typeof PRIORITY_SIZES)[number],
  allowFallback: boolean = true,
): string | null {
  const wantedSize = entity[`image${prioSize}`]

  if (wantedSize) {
    return wantedSize
  }

  if (allowFallback) {
    const currentIndex = PRIORITY_SIZES.indexOf(prioSize)
    if (currentIndex < PRIORITY_SIZES.length - 1) {
      return getImageFromEntity(entity, PRIORITY_SIZES[currentIndex + 1], true)
    }
  }

  return null
}
