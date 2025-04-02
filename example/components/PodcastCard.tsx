import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Plus } from "@tamagui/lucide-icons"
import { Card, H4, Paragraph, XStack, YStack, Button, Spinner, Image } from "tamagui"

import { RootStackParamList } from "../types/navigation"

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

type PodcastCardProps = {
  id: string
  title: string
  author?: string | null
  description?: string | null
  cover?: string | null
  Actions?: React.ReactElement
} & React.ComponentProps<typeof Card>

export function PodcastCard({ id, title, author, description, cover, Actions, ...props }: PodcastCardProps) {
  const navigation = useNavigation<NavigationProp>()

  return (
    <Card
      bordered
      animation="bouncy"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
      onPress={() => navigation.navigate("Podcast", { id })}
      {...props}
    >
      <Card.Header padded>
        <XStack gap="$3">
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
        </XStack>
      </Card.Header>
    </Card>
  )
}
