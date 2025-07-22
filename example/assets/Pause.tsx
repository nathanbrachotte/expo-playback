import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

export const Pause = (props: SvgProps & { size?: number }) => (
  <Svg viewBox="0 0 16 16" width={props.size} height={props.size} {...props}>
    <Path
      fillRule="evenodd"
      d="M5 2a1 1 0 0 1 1 1v10a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1m6 0a1 1 0 0 1 1 1v10a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1"
      clipRule="evenodd"
    />
  </Svg>
)
