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

    // Try smaller sizes first
    for (let i = currentIndex + 1; i < PRIORITY_SIZES.length; i++) {
      const smallerSize = entity[`image${PRIORITY_SIZES[i]}`]
      if (smallerSize) {
        return smallerSize
      }
    }

    // If no smaller sizes found, try larger sizes
    for (let i = currentIndex - 1; i >= 0; i--) {
      const largerSize = entity[`image${PRIORITY_SIZES[i]}`]
      if (largerSize) {
        return largerSize
      }
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
  console.log("🚀 ~ containImage ~ imageKeys:", imageKeys)

  return imageKeys.some((key) => Boolean(entity[key]))
}

export function getImageFromEntities(
  episode?: EntityImage,
  podcast?: EntityImage,
  prioritySize: (typeof PRIORITY_SIZES)[number] = "100",
): string | null {
  if (episode && containImage(episode)) {
    console.log("🚀 ~ getImageFromEntities ~ episode:", episode)
    const image = getImageFromEntity(episode, prioritySize)
    console.log("🚀 ~ getImageFromEntities ~ image:", image)
    return image
  }

  if (podcast && containImage(podcast)) {
    console.log("🚀 ~ getImageFromEntities ~ podcast:", podcast)
    const image = getImageFromEntity(podcast, prioritySize)
    console.log("🚀 ~ getImageFromEntities ~ image:", image)
    return image
  }
  return null
}
