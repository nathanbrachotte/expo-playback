import * as ExpoPlayback from "expo-playback";
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Example podcast URL and skip segments
    const podcastUrl = require("./example2.1.mp3");
    const skipSegments = [
      { startTime: 30, endTime: 45 }, // Skip 30-45 seconds
      { startTime: 120, endTime: 180 }, // Skip 2-3 minutes
    ];

    // Initialize player
    ExpoPlayback.initializePlayer(podcastUrl, skipSegments);

    // Listen for playback status updates
    const statusSubscription = ExpoPlayback.addPlaybackStatusListener(
      (status) => {
        setIsPlaying(status.isPlaying);
        setCurrentTime(status.currentTime);
        setDuration(status.duration);
      }
    );

    // Listen for skip segment events
    const skipSubscription = ExpoPlayback.addSkipSegmentListener((event) => {
      console.log(
        `Skipping segment from ${event.startTime} to ${event.endTime}`
      );
    });

    // Cleanup
    return () => {
      statusSubscription.remove();
      skipSubscription.remove();
      ExpoPlayback.cleanup();
    };
  }, []);

  const togglePlayback = async () => {
    if (isPlaying) {
      await ExpoPlayback.pause();
    } else {
      await ExpoPlayback.play();
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Purecast Player</Text>

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>
      </View>

      <View style={styles.controls}>
        <Button title={isPlaying ? "Pause" : "Play"} onPress={togglePlayback} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  timeContainer: {
    marginVertical: 20,
  },
  timeText: {
    fontSize: 18,
  },
  controls: {
    flexDirection: "row",
    gap: 20,
  },
});
