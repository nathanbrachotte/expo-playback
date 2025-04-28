import { Play, Pause, SkipBack, SkipForward, X } from "@tamagui/lucide-icons"
import { Button, H4, Slider, Text, YStack, XStack, Image, AnimatePresence } from "tamagui"
import { usePlayerContext } from "../../providers/PlayerProvider"

export function Player() {
  const { activeEpisode, setActiveEpisodeId } = usePlayerContext()

  console.log("🚀 ~ Player ~ Episode:", activeEpisode)

  if (!activeEpisode) {
    return null
  }

  return (
    <YStack bg="$color5">
      <AnimatePresence>
        {activeEpisode && (
          <YStack
            py="$6"
            px="$4"
            borderTopWidth={1}
            borderColor="$borderColor"
            bg="$color5"
            position="relative"
            bottom={0}
            left={0}
            right={0}
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
            <XStack>
              {/* Album Art */}
              {activeEpisode.image ? (
                <Image
                  source={{ uri: activeEpisode.image }}
                  width={50}
                  height={50}
                  borderRadius="$2"
                  resizeMode="cover"
                />
              ) : (
                <YStack width={50} height={50} bg="$blue8" borderRadius="$2" overflow="hidden" />
              )}

              <YStack flex={1} ml="$3">
                <H4 numberOfLines={1} fontSize="$5">
                  {activeEpisode.title}
                </H4>
                <Text numberOfLines={1} opacity={0.7} fontSize="$3">
                  {activeEpisode.podcastId}
                </Text>
              </YStack>

              {/* Close Button */}
              <Button
                size="$2"
                circular
                icon={<X size={16} />}
                onPress={() => setActiveEpisodeId(null)}
                opacity={0.7}
              />
            </XStack>

            {/* Progress Bar */}
            <YStack mt="$5">
              <Slider size="$2" defaultValue={[0]} value={[0]} max={100} step={1} onValueChange={() => {}}>
                <Slider.Track>
                  <Slider.TrackActive />
                </Slider.Track>
                <Slider.Thumb circular index={0} />
              </Slider>

              <XStack mt="$1">
                <Text fontSize="$2" flex={1}>
                  0:00
                </Text>
                <Text fontSize="$2" flex={1}>
                  0:00
                </Text>
              </XStack>
            </YStack>

            {/* Controls */}
            <XStack mt="$3" mb="$1" justifyContent="center" alignItems="center">
              <YStack flex={1} />
              <Button size="$3" icon={<SkipBack size={16} />} onPress={() => {}} />

              <YStack mx="$4">
                <Button size="$6" circular theme="blue" icon={<Play size={24} />} onPress={() => {}} />
              </YStack>

              <Button size="$3" icon={<SkipForward size={16} />} onPress={() => {}} />
              <YStack flex={1} />
            </XStack>
          </YStack>
        )}
      </AnimatePresence>
    </YStack>
  )
}
