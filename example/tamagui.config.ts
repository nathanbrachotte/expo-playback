import { createAnimations } from "@tamagui/animations-react-native"
import { defaultConfig } from "@tamagui/config/v4"
import { createInterFont } from "@tamagui/font-inter"
import { shorthands } from "@tamagui/shorthands"
import { themes, tokens } from "@tamagui/themes"
import { createTamagui } from "tamagui"

export const tamaguiConfig = createTamagui(defaultConfig)

const animations = createAnimations({
  bouncy: {
    type: "spring",
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: "spring",
    damping: 20,
    stiffness: 60,
  },
  quick: {
    type: "spring",
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
})

const headingFont = createInterFont()
const bodyFont = createInterFont()

const config = createTamagui({
  animations,
  defaultTheme: "light",
  shouldAddPrefersColorThemes: false,
  themeClassNameOnRoot: false,
  shorthands,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  themes,
  tokens,
})

export type AppConfig = typeof config

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
