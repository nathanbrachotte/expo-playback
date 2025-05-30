import { ArrowUp, Play, SkipBack, SkipForward } from "@tamagui/lucide-icons"
import { PropsWithChildren, useState } from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Button, Slider, Text, Image, AnimatePresence, Sheet, H3, H5, Progress } from "tamagui"

import { usePlayerContext } from "../../providers/PlayerProvider"
import { getImageFromEntity } from "../../utils/image.utils"
import { CoverImage, FULL_PLAYER_IMAGE_SIZE } from "../CoverImage"
import { PureYStack, PureXStack } from "../PureStack"
import { PlayerSkipBackButton, PlayerPlayButton, PlayerSkipForwardButton } from "./PlayerButtons"

export const PLAYER_HEIGHT = 100

function PlayerBackground({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets()

  return (
    <PureYStack height={PLAYER_HEIGHT} pb={insets.bottom} bg="$background">
      {children}
    </PureYStack>
  )
}

function PlayerSheet({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
}) {
  const { activeEpisode } = usePlayerContext()
  const { title } = activeEpisode?.episode ?? {}
  const { title: podcastTitle } = activeEpisode?.podcast ?? {}
  const insets = useSafeAreaInsets()

  const episodeImage = getImageFromEntity(activeEpisode?.episode ?? {}, "100")
  const podcastImage = getImageFromEntity(activeEpisode?.podcast ?? {}, "100")

  const imageSource = episodeImage ?? podcastImage ?? false

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={onOpenChange}
      snapPoints={[90]}
      dismissOnSnapToBottom
      animation="quick"
    >
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
        <CoverImage entity={activeEpisode?.episode ?? {}} />

        {/* Controls */}
        <PureYStack
          mb={insets.bottom}
          justifyContent="flex-end"
          alignItems="center"
          f={1}
          gap="$4"
          px="$4"
        >
          <Slider
            size="$2"
            defaultValue={[0]}
            value={[50]}
            max={100}
            step={1}
            onValueChange={() => {}}
            w={FULL_PLAYER_IMAGE_SIZE}
          >
            <Slider.Track w="$full">
              <Slider.TrackActive />
            </Slider.Track>
            <Slider.Thumb circular index={0} />
          </Slider>

          {/* // TODO: Fix layout */}
          <PureXStack mt="$1">
            <Text fontSize="$2" flex={1}>
              0:00
            </Text>
            <Text fontSize="$2" flex={1}>
              0:00
            </Text>
          </PureXStack>
          <PureXStack ai="center" gap="$1">
            <PlayerSkipBackButton />
            <PlayerPlayButton />
            <PlayerSkipForwardButton />
          </PureXStack>
        </PureYStack>
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
          <PureYStack
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
            <PureXStack justifyContent="space-between" alignItems="center">
              {episodeImage ? (
                <Image
                  source={{ uri: episodeImage }}
                  width={50}
                  height={50}
                  borderRadius="$2"
                  resizeMode="cover"
                />
              ) : (
                <PureYStack
                  width={50}
                  height={50}
                  bg="$blue8"
                  borderRadius="$2"
                  overflow="hidden"
                />
              )}

              <Button size="$3" icon={<ArrowUp size={16} />} onPress={openSheet} />
            </PureXStack>
          </PureYStack>
        )}
      </AnimatePresence>
    </PlayerBackground>
  )
}
