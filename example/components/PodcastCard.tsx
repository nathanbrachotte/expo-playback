import { useNavigation } from "@react-navigation/native"
import { Card, H4, Paragraph, YStack, Image } from "tamagui"

// type NavigationProp = NativeStackNavigationProp<RootStackParamList>

type PodcastCardProps = {
  id: string
  title: string
  author?: string | null
  description?: string | null
  cover?: string | null
  Actions?: React.ReactElement
} & React.ComponentProps<typeof Card>

export function PodcastCard({ id, title, author, description, cover, Actions, ...props }: PodcastCardProps) {
  const navigation = useNavigation()
  // const navigation = useNavigation<NavigationProp>()

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
      {...props}
    >
      {cover && <Image source={{ uri: cover }} width={60} height={60} borderRadius="$4" resizeMode="cover" />}
      <YStack flex={1} gap="$1">
        <H4>{title}</H4>
        <Paragraph>{author}</Paragraph>
        {description ? (
          <Paragraph size="$2" color="$gray11">
            {description}
          </Paragraph>
        ) : null}
      </YStack>
      {Actions}
    </Card>
  )
}
