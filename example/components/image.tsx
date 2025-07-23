import { useState } from "react"
import { Image } from "expo-image"
import { getVariable, Square, SquareProps } from "tamagui"

type ImageProps = {
  uri: string | null
  fallbackColor?: string
  priority?: "low" | "normal" | "high"
} & Omit<SquareProps, "children">

export function PureImage({
  uri,
  fallbackColor = "$color5",
  borderRadius = "$3",
  priority = "normal",
  ...props
}: ImageProps) {
  const [hasError, setHasError] = useState(false)

  if (!uri || hasError) {
    return (
      <Square
        {...props}
        backgroundColor={fallbackColor}
        overflow="hidden"
        borderRadius={borderRadius}
      />
    )
  }

  const borderRadiusNumber = getVariable(borderRadius)

  return (
    <Square {...props} overflow="hidden" borderRadius={borderRadius}>
      <Square
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor={fallbackColor}
        borderRadius={borderRadius}
      />
      <Image
        style={{
          width: "100%",
          height: "100%",
          borderRadius: borderRadiusNumber,
        }}
        source={{
          uri,
        }}
        onError={() => setHasError(true)}
      />
    </Square>
  )
}
