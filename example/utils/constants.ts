import { Dimensions } from "react-native"

//'\u2009' is a Unicode "thin space", that prevents the last italic character to be cut-off
export const HALF_SPACE = "\u2009"

export const DEVICE_WIDTH = Dimensions.get("window").width
export const DEVICE_HEIGHT = Dimensions.get("window").height
export const FULL_PLAYER_IMAGE_SIZE = DEVICE_WIDTH * 0.55

export const PURECAST_EMAIL = "hey+purecast@nathanbrachotte.dev"
