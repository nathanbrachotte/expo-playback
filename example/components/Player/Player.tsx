import { ArrowUp } from "@tamagui/lucide-icons"
import { PropsWithChildren, useState } from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import {
  Button,
  Slider,
  Image,
  AnimatePresence,
  Sheet,
  H4,
  H6,
  Separator,
  Paragraph,
} from "tamagui"

import { usePlayerContext } from "../../providers/PlayerProvider"
import { formatPlayerTime, formatPlayerRemainingTimeFromDuration } from "../../utils/time.utils"
import { getImageFromEntity } from "../../utils/image.utils"
import { CoverImage, FULL_PLAYER_IMAGE_SIZE } from "../CoverImage"
import { PureYStack, PureXStack } from "../PureStack"
import { LargePlayerSection, SmallPlayerSection } from "./PlayerButtons"
import { EpisodeDescriptionHtml } from "../episode"

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
  const { activeEpisode, progress, onSliderValueChange } = usePlayerContext()
  const { title } = activeEpisode?.episode ?? {}
  const { title: podcastTitle } = activeEpisode?.podcast ?? {}
  const insets = useSafeAreaInsets()

  const episodeImage = getImageFromEntity(activeEpisode?.episode ?? {}, "100")
  const podcastImage = getImageFromEntity(activeEpisode?.podcast ?? {}, "100")

  const imageSource = episodeImage ?? podcastImage ?? null

  // Convert duration from milliseconds to seconds for display
  const totalDurationSeconds = (activeEpisode?.episode?.duration ?? 0) / 1000
  const currentTimeSeconds = progress
  const progressPercentage =
    totalDurationSeconds > 0 ? (currentTimeSeconds / totalDurationSeconds) * 100 : 0

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

      <Sheet.Frame bg="$backgroundHover" gap="$2" py="$2" alignItems="center">
        <Sheet.Handle backgroundColor="$borderColor" width="$5" height="$0.5" />
        {/* Header */}
        <PureYStack>
          <H6 textAlign="center">{podcastTitle}</H6>
          <Separator mt="$1.5" mb="$1" borderBottomColor="$color7" />
          <H4 textAlign="center">{title}</H4>
        </PureYStack>

        <PureYStack f={1} gap="$2" mt="$2" ai="center" px="$2">
          {/* Image */}
          <CoverImage imageString={imageSource} />

          {/* Description */}
          <Sheet.ScrollView f={1} gap="$4" px="$4" mt="$2" alwaysBounceVertical={false}>
            <EpisodeDescriptionHtml description={activeEpisode?.episode?.description} />
          </Sheet.ScrollView>
        </PureYStack>

        <PureYStack mb={insets.bottom} mt="$2">
          {/* Controls */}
          <PureYStack gap="$1.5">
            <Slider
              size="$2"
              // Keep this for testing UI.
              // value={[0]}
              // value={[100]}
              value={[progressPercentage]}
              max={100}
              step={1}
              onValueChange={(value) => {
                const newTime = (value[0] / 100) * totalDurationSeconds
                onSliderValueChange([newTime])
              }}
              w={FULL_PLAYER_IMAGE_SIZE * 1.3}
            >
              <Slider.Track w="$full">
                <Slider.TrackActive />
              </Slider.Track>
              <Slider.Thumb circular index={0} size="$1" />
            </Slider>
            <PureXStack mt="$2.5" mx="$-1.5">
              <Paragraph flex={1}>{formatPlayerTime(currentTimeSeconds)}</Paragraph>
              <Paragraph flex={1} textAlign="right">
                {formatPlayerRemainingTimeFromDuration(currentTimeSeconds, totalDurationSeconds)}
              </Paragraph>
            </PureXStack>
          </PureYStack>
          {/* Player */}
          <LargePlayerSection />
        </PureYStack>
      </Sheet.Frame>
    </Sheet>
  )
}
export function SmallPlayer({ openSheet }: { openSheet: VoidFunction }) {
  const { activeEpisode } = usePlayerContext()

  const episodeImage = getImageFromEntity(activeEpisode?.episode ?? {}, "100")

  return (
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
              <PureYStack width={50} height={50} bg="$blue8" borderRadius="$2" overflow="hidden" />
            )}
            <SmallPlayerSection />

            <Button size="$3" icon={<ArrowUp size={16} />} onPress={openSheet} />
          </PureXStack>
        </PureYStack>
      )}
    </AnimatePresence>
  )
}

export function Player() {
  // TODO: When the user swipes, next / previous episode?
  const { activeEpisode, setActiveEpisodeId } = usePlayerContext()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  if (!activeEpisode) {
    return <PlayerBackground />
  }

  const openSheet = () => {
    setIsSheetOpen(true)
  }

  return (
    <PlayerBackground>
      <PlayerSheet isOpen={isSheetOpen} onOpenChange={setIsSheetOpen} />
      <SmallPlayer openSheet={openSheet} />
    </PlayerBackground>
  )
}
