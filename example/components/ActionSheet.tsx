import { Sheet, Button, YStack, Paragraph, Separator, ButtonProps } from "tamagui"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import React from "react"

export type ActionSheetAction = {
  label: string
  onPress: () => void
  isDestructive?: boolean
  Icon?: ButtonProps["icon"]
}

export type ActionSheetProps = {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  actions: ActionSheetAction[]
  cancelAction?: ActionSheetAction
  title?: string
}

export function ActionSheet({
  isOpen,
  onOpenChange,
  actions,
  cancelAction,
  title,
}: ActionSheetProps) {
  const insets = useSafeAreaInsets()

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={onOpenChange}
      snapPoints={[30]}
      dismissOnSnapToBottom
      animation="quick"
      zIndex={100000}
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0,0,0,0.5)"
      />

      <Sheet.Frame bg="$background" pb={insets.bottom}>
        <Sheet.Handle
          backgroundColor="$borderColor"
          width="$5"
          height="$0.5"
          alignSelf="center"
          mt="$2"
        />

        {/* Title and message section */}
        {title ? (
          <YStack p="$4" gap="$2">
            <Paragraph fontWeight="bold" textAlign="center">
              {title}
            </Paragraph>
          </YStack>
        ) : null}

        {/* Actions */}
        <YStack justifyContent="space-between" flex={1}>
          <YStack>
            {actions.map((action, index) => (
              <YStack key={action.label}>
                {index > 0 && <Separator />}
                <Button
                  onPress={() => {
                    action.onPress()
                    onOpenChange(false)
                  }}
                  bg="transparent"
                  size="$5"
                  borderRadius={0}
                  justifyContent="flex-start"
                  icon={action.Icon}
                >
                  <Button.Text color={action.isDestructive ? "$red10" : "$color"}>
                    {action.label}
                  </Button.Text>
                </Button>
              </YStack>
            ))}
          </YStack>
        </YStack>

        {/* Cancel button */}
        {cancelAction && (
          <>
            <Button
              onPress={() => {
                cancelAction.onPress()
                onOpenChange(false)
              }}
              // bg="transparent"
              size="$4"
              borderRadius={0}
              icon={cancelAction.Icon}
            >
              <Button.Text>{cancelAction.label}</Button.Text>
            </Button>
          </>
        )}
      </Sheet.Frame>
    </Sheet>
  )
}
