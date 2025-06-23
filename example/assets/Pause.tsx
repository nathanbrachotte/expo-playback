import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

export function Pause(props: SvgProps) {
  return (
    <Svg width="800px" height="800px" viewBox="-1 0 8 8" {...props}>
      <Path
        d="M172 3605a1 1 0 00-1 1v6a1 1 0 002 0v-6a1 1 0 00-1-1m5 1v6a1 1 0 01-2 0v-6a1 1 0 012 0"
        transform="translate(-227 -3765) translate(56 160)"
        fill="#000"
        stroke="none"
        strokeWidth={1}
        fillRule="evenodd"
      />
    </Svg>
  )
}
