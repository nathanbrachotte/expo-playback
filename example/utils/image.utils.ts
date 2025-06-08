import { EntityImage } from "../types/db.types"

const PRIORITY_SIZES = ["30", "60", "100", "600"] as const

export function getImageFromEntity(
  entity: EntityImage,
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

type ImageKey<T> = Extract<keyof T, `image${string}`>

export function containImage(entity: EntityImage | undefined | null): boolean {
  if (!entity) return false

  const imageKeys = Object.keys(entity).filter((key): key is ImageKey<EntityImage> =>
    key.startsWith("image"),
  )

  return imageKeys.some((key) => Boolean(entity[key]))
}

export function getImageFromEntities(episode?: EntityImage, podcast?: EntityImage): string | null {
  if (episode && containImage(episode)) {
    return getImageFromEntity(episode, "100")
  }

  if (podcast && containImage(podcast)) {
    return getImageFromEntity(podcast, "100")
  }
  return null
}
