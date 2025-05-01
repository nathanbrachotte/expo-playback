import { ArrowUp, Play, SkipBack, SkipForward } from "@tamagui/lucide-icons"
import { PropsWithChildren, useState } from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Button, Slider, Text, YStack, XStack, Image, AnimatePresence, Sheet, H3, H5 } from "tamagui"

import { usePlayerContext } from "../../providers/PlayerProvider"
import { DEVICE_WIDTH } from "../../utils/constants"
import { getImageFromEntity } from "../../utils/image.utils"
import { PureYStack } from "../PureStack"

export const PLAYER_HEIGHT = 100
const PLAYER_IMAGE_SIZE = DEVICE_WIDTH * 0.8

function PlayerBackground({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets()

  return (
    <YStack height={PLAYER_HEIGHT} pb={insets.bottom} bg="$background">
      {children}
    </YStack>
  )
}

function PlayerControls() {
  return (
    <XStack ai="center" gap="$1">
      <Button size="$3" icon={<SkipBack size={16} />} onPress={() => {}} />
      <Button size="$5" circular theme="blue" icon={<Play size={24} />} onPress={() => {}} />
      <Button size="$3" icon={<SkipForward size={16} />} onPress={() => {}} />
    </XStack>
  )
}

function PlayerSheet({ isOpen, onOpenChange }: { isOpen: boolean; onOpenChange: (isOpen: boolean) => void }) {
  const { activeEpisode } = usePlayerContext()
  const { title } = activeEpisode?.episode ?? {}
  const { title: podcastTitle } = activeEpisode?.podcast ?? {}
  const insets = useSafeAreaInsets()

  const episodeImage = getImageFromEntity(activeEpisode?.episode ?? {}, "100")
  const podcastImage = getImageFromEntity(activeEpisode?.podcast ?? {}, "100")

  const imageSource = episodeImage ?? podcastImage ?? false

  return (
    <Sheet modal open={isOpen} onOpenChange={onOpenChange} snapPoints={[90]} dismissOnSnapToBottom animation="quick">
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0,0,0,0.5)"
      />

      <Sheet.Frame bg="$backgroundHover" gap="$2" py="$2" px="$4" alignItems="center">
        <Sheet.Handle backgroundColor="$borderColor" width="$5" height="$0.5" />
        {/* Header */}
        <PureYStack>
          <H5 textAlign="center">{podcastTitle}</H5>
          <H3 textAlign="center">{title}</H3>
        </PureYStack>

        {/* Image */}
        {imageSource ? (
          <Image
            mt="$4"
            borderRadius="$6"
            source={{ uri: imageSource }}
            width={PLAYER_IMAGE_SIZE}
            height={PLAYER_IMAGE_SIZE}
            resizeMode="cover"
          />
        ) : (
          <YStack width={PLAYER_IMAGE_SIZE} height={PLAYER_IMAGE_SIZE} borderRadius="$6" />
        )}

        {/* Controls */}
        <YStack mb={insets.bottom} justifyContent="flex-end" alignItems="center" f={1} gap="$4" px="$4">
          <Slider
            size="$2"
            defaultValue={[0]}
            value={[50]}
            max={100}
            step={1}
            onValueChange={() => {}}
            w={PLAYER_IMAGE_SIZE}
          >
            <Slider.Track w="$full">
              <Slider.TrackActive />
            </Slider.Track>
            <Slider.Thumb circular index={0} />
          </Slider>

          {/* // TODO: Fix layout */}
          <XStack mt="$1">
            <Text fontSize="$2" flex={1}>
              0:00
            </Text>
            <Text fontSize="$2" flex={1}>
              0:00
            </Text>
          </XStack>
          <PlayerControls />
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}

export function Player() {
  const { activeEpisode, setActiveEpisodeId } = usePlayerContext()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  if (!activeEpisode) {
    return <PlayerBackground />
  }

  const openSheet = () => {
    setIsSheetOpen(true)
  }

  const episodeImage = getImageFromEntity(activeEpisode?.episode ?? {}, "100")

  return (
    <PlayerBackground>
      <PlayerSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />
      <AnimatePresence>
        {activeEpisode && (
          <YStack
            bg="$background"
            onPress={openSheet}
            px="$5"
            py="$2"
            borderTopWidth={1}
            borderColor="$borderColor"
            animation="quick"
            enterStyle={{
              y: 100,
              opacity: 0,
            }}
            exitStyle={{
              y: 100,
              opacity: 0,
            }}
            y={0}
            opacity={1}
          >
            <XStack justifyContent="space-between" alignItems="center">
              {episodeImage ? (
                <Image source={{ uri: episodeImage }} width={50} height={50} borderRadius="$2" resizeMode="cover" />
              ) : (
                <YStack width={50} height={50} bg="$blue8" borderRadius="$2" overflow="hidden" />
              )}

              {/* Controls */}
              <PlayerControls />

              <Button size="$3" icon={<ArrowUp size={16} />} onPress={openSheet} />
            </XStack>
          </YStack>
        )}
      </AnimatePresence>
    </PlayerBackground>
  )
}
