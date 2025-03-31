import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { Bookmark, Plus } from "@tamagui/lucide-icons"
import { Card, H4, Paragraph, XStack, YStack, Button, Spinner, Image } from "tamagui"

import { RootStackParamList } from "../types/navigation"

type NavigationProp = NativeStackNavigationProp<RootStackParamList>

interface PodcastCardProps {
  id: string
  title: string
  author: string
  description?: string
  artworkUrl100?: string
  onSave: () => void
  isSaving?: boolean
}

export function PodcastCard({ id, title, author, description, artworkUrl100, onSave, isSaving }: PodcastCardProps) {
  const navigation = useNavigation<NavigationProp>()

  return (
    <Card
      bordered
      animation="bouncy"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
      onPress={() => navigation.navigate("Podcast", { id })}
    >
      <Card.Header padded>
        <XStack gap="$3">
          {artworkUrl100 && (
            <Image source={{ uri: artworkUrl100 }} width={60} height={60} borderRadius="$4" resizeMode="cover" />
          )}
          <YStack flex={1} gap="$1">
            <H4>{title}</H4>
            <Paragraph>{author}</Paragraph>
            {description ? (
              <Paragraph size="$2" color="$gray11">
                {description}
              </Paragraph>
            ) : null}
          </YStack>
          <Button
            size="$3"
            circular
            icon={isSaving ? () => <Spinner /> : () => <Plus size={16} />}
            onPress={onSave}
            disabled={isSaving}
          />
        </XStack>
      </Card.Header>
    </Card>
  )
}
