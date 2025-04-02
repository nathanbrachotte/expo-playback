import { useToastState, Toast } from "@tamagui/toast"
import React, { PropsWithChildren } from "react"
import { YStack } from "tamagui"

const SuccessToast = () => {
  const currentToast = useToastState()
  console.log("🚀 ~ SuccessToast ~ currentToast:", currentToast)

  if (!currentToast || currentToast.isHandledNatively) return null
  return (
    <Toast
      key={currentToast.id}
      duration={currentToast.duration}
      enterStyle={{ opacity: 0, scale: 0.5, y: 25 }}
      exitStyle={{ opacity: 0, scale: 1, y: 20 }}
      // TODO: Get this from the layout
      y={-25}
      opacity={1}
      scale={1}
      animation="quick"
      // TODO: Wire toasts to the right type somehow
      viewportName={currentToast.viewportName}
      bg="$green4"
    >
      <YStack>
        <Toast.Title>{currentToast.title}</Toast.Title>
        {!!currentToast.message && <Toast.Description>{currentToast.message}</Toast.Description>}
      </YStack>
    </Toast>
  )
}

export function ToastWrapper({ children }: PropsWithChildren) {
  return (
    <>
      <SuccessToast />
      {children}
    </>
  )
}
