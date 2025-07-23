import { useState } from "react"
import { Image } from "expo-image"
import { getVariable, Square, SquareProps, styled } from "tamagui"

type ImageProps = {
  uri: string | null
  fallbackColor?: string
  onLoadEnd?: () => void
  onError?: () => void
  priority?: "low" | "normal" | "high"
} & Omit<SquareProps, "children">

const StyledImage = styled(Image, {
  name: "StyledImage",
})

export function PureImage({
  uri,
  fallbackColor = "$color5",
  onLoadEnd,
  onError,
  borderRadius = "$3",
  priority = "normal",
  ...props
}: ImageProps) {
  const [isLoading, setIsLoading] = useState(true)
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
      {isLoading && (
        <Square
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundColor={fallbackColor}
          borderRadius={borderRadius}
          zIndex={1}
        />
      )}
      <StyledImage
        style={{
          width: "100%",
          height: "100%",
          borderRadius: borderRadiusNumber,
        }}
        source={{
          uri,
        }}
        onLoad={() => {
          setIsLoading(false)
          onLoadEnd?.()
        }}
        onError={() => {
          setHasError(true)
          onError?.()
        }}
      />
    </Square>
  )
}
