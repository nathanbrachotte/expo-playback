import { resolveValue, toast, ToastOptions, ToastPosition } from "@backpackapp-io/react-native-toast"
import { colorTokens } from "@tamagui/themes"
import React from "react"
import { Easing } from "react-native-reanimated"
import { Button, ButtonText, Paragraph, YStack } from "tamagui"

import { DEVICE_WIDTH } from "../utils/constants"

type ToastParams = {
  message: string
  config?: ToastOptions
}

// TODO: Add dynamically picking up the light or dark palette based on client theme.
const DEFAULT_CONFIG = {
  position: ToastPosition.BOTTOM,
  duration: 3000,
  styles: {
    pressable: {},
    view: {
      // backgroundColor: colorTokens.dark.gray.gray1,
      // borderRadius: 12,
    },
  },
  animationType: "timing",
  animationConfig: {
    duration: 500,
    flingPositionReturnDuration: 200,
    easing: Easing.elastic(1),
  },
} as const satisfies ToastOptions

export const PURE_TOASTS = {
  success: ({ message, config }: ToastParams) =>
    toast(message, {
      ...DEFAULT_CONFIG,
      ...config,
      icon: "✅",
      styles: {
        ...DEFAULT_CONFIG.styles,
        pressable: {
          backgroundColor: colorTokens.dark.green.green1,
          ...config?.styles?.pressable,
        },
      },
    }),
  error: ({ message, config }: ToastParams) =>
    toast(message, {
      ...DEFAULT_CONFIG,
      ...config,
      icon: "❌",
      styles: {
        ...DEFAULT_CONFIG.styles,
        pressable: {
          backgroundColor: "transparent",
          ...config?.styles?.pressable,
        },
        view: {
          backgroundColor: colorTokens.dark.gray.gray1,
          borderColor: colorTokens.dark.red.red8,
          borderRadius: 12,
          borderWidth: 1,
        },
      },
    }),
  custom: ({ message, config }: ToastParams) => toast(message, { ...DEFAULT_CONFIG, ...config }),
  defaultError: ({
    messages = {
      title: "Oh no! Something went wrong.",
      cta: "Try again",
    },
    config,
    onPress,
  }: {
    messages?: {
      title: string
      cta: string
    }
    config?: ToastOptions
    onPress?: () => void
  } = {}) =>
    toast(messages.title, {
      width: DEVICE_WIDTH,
      ...DEFAULT_CONFIG,
      ...config,
      // We can extract this into a component to be able to reuse the styles
      customToast(currentToast) {
        return (
          <YStack width={currentToast.width} height="auto">
            <YStack
              marginHorizontal="$4"
              justifyContent="center"
              alignItems="center"
              backgroundColor="$color1"
              borderRadius="$4"
              borderWidth={1}
              borderColor="$primary7"
              p="$3"
            >
              <Paragraph>{resolveValue(currentToast.message, currentToast)}</Paragraph>
              {/* FIXME: Since the toast bg is black, we'd wanna have a "dark mode" Button. 
              PB: we have dark mode by default but our bg is red so our dark mode button bg is black because of our primary color,
              and black in light mode (that's how it's supposed to be), text on light mode is black. We probably need to fix the base background for this to work */}
              <Button size="$3" mt="$4" onPress={onPress} bg="$color">
                <ButtonText color="$color1">{messages.cta}</ButtonText>
              </Button>
            </YStack>
          </YStack>
        )
      },
    }),
  veryCustom: <T extends unknown>(
    messages: {
      loading: string
      success: (data: T) => string
      error: (err: unknown) => string
    },
    myPromise: Promise<T>,
    config?: ToastOptions,
  ) =>
    toast.promise(
      myPromise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        ...DEFAULT_CONFIG,
        ...config,
      },
    ),
}
