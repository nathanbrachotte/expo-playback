import { useNavigation } from "@react-navigation/native"
import { Card, H4, Paragraph, YStack } from "tamagui"
import { getVariable } from "tamagui"

import { PureImage } from "./image"

// type NavigationProp = NativeStackNavigationProp<RootStackParamList>

type PodcastCardProps = {
  id: string
  title: string
  author?: string | null
  description?: string | null
  cover: string | null
  Actions?: React.ReactElement
} & React.ComponentProps<typeof Card>

export function PodcastCard({
  id,
  title,
  author,
  description,
  cover,
  Actions,
  ...props
}: PodcastCardProps) {
  const navigation = useNavigation()
  const imageSize = getVariable("$6") // This will be 60px based on the original size

  return (
    <Card
      bordered
      animation="bouncy"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
      onPress={() => navigation.navigate("Podcast", { id })}
      p="$2"
      gap="$3"
      flexDirection="row"
      overflow="hidden"
      {...props}
    >
      <PureImage uri={cover} width={imageSize} height={imageSize} />
      <YStack flex={1} gap="$1" justifyContent="center">
        <H4 numberOfLines={1} maxWidth="$14">
          {title}
        </H4>
        {author ? (
          <Paragraph numberOfLines={1} maxWidth="$14" color="$gray11">
            {author}
          </Paragraph>
        ) : null}
        {description ? (
          <Paragraph size="$2" color="$gray11" numberOfLines={2}>
            {description}
          </Paragraph>
        ) : null}
      </YStack>
      {Actions && <YStack justifyContent="center">{Actions}</YStack>}
    </Card>
  )
}
