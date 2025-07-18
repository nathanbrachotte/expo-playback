import { useState } from "react"
import FastImage from "react-native-fast-image"
import { getVariable, Square, SquareProps, styled } from "tamagui"

type FastImageProps = {
  uri: string | null
  fallbackColor?: string
  onLoadEnd?: () => void
  onError?: () => void
  resizeMode?: "cover" | "contain" | "stretch" | "center"
  priority?: "low" | "normal" | "high"
} & Omit<SquareProps, "children">

const StyledFastImage = styled(FastImage, {
  name: "StyledFastImage",
})

export function PureImage({
  uri,
  fallbackColor = "$color5",
  onLoadEnd,
  onError,
  resizeMode = "cover",
  borderRadius = "$3",
  priority = "normal",
  ...props
}: FastImageProps) {
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
      <StyledFastImage
        style={{
          width: "100%",
          height: "100%",
          borderRadius: borderRadiusNumber,
        }}
        source={{
          uri,
          priority: FastImage.priority[priority],
          cache: FastImage.cacheControl.immutable,
        }}
        onLoadEnd={() => {
          setIsLoading(false)
          onLoadEnd?.()
        }}
        onError={() => {
          setHasError(true)
          onError?.()
        }}
        resizeMode={FastImage.resizeMode[resizeMode]}
      />
    </Square>
  )
}
