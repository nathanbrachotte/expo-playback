import AVFoundation
import ExpoModulesCore

struct SkipSegment: Record {
    @Field var startTime: Double
    @Field var endTime: Double
}

public class ExpoPlaybackModule: Module {
    private var player: AVPlayer?
    private var skipSegments: [SkipSegment] = []
    private var timeObserverToken: Any?

    private func getFirstEpisode() -> Result<Episode, PlaybackError> {
        let podcastRepo = PodcastRepository()
        let episodeRepo = EpisodeRepository()

        // Get first podcast
        let podcasts = podcastRepo.getAllPodcasts()
        guard let firstPodcast = podcasts.first else {
            return .failure(.noPodcastFound)
        }

        // Get first episode of the podcast
        let episodes = episodeRepo.getEpisodesByPodcastId(podcastIdValue: firstPodcast.id)
        guard let firstEpisode = episodes.first else {
            return .failure(.noEpisodeFound)
        }

        return .success(firstEpisode)
    }

    // Each module class must implement the definition function. The definition consists of components
    // that describes the module's functionality and behavior.
    // See https://docs.expo.dev/modules/module-api for more details about available components.
    public func definition() -> ModuleDefinition {
        // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
        // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
        // The module will be accessible from `requireNativeModule('ExpoPlayback')` in JavaScript.
        Name("ExpoPlayback")

        // Events that will be emitted to JavaScript
        Events("onPlaybackStatusUpdate", "onSkipSegmentReached")

        // Initialize player with skip segments
        AsyncFunction("initializePlayer") {
            (url: String, segments: [SkipSegment], promise: Promise) in
            guard
                let audioUrl = URL(
                    string:
                        "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3")
            else {
                promise.reject(PlaybackError.invalidUrl)
                return
            }

            self.skipSegments = segments
            let playerItem = AVPlayerItem(url: audioUrl)
            self.player = AVPlayer(playerItem: playerItem)
            do {
                try AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
                try AVAudioSession.sharedInstance().setActive(true)
            } catch {
                print("Failed to set audio session category. Error: \(error)")
            }

            // Add periodic time observer
            let interval = CMTime(seconds: 0.5, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
            self.timeObserverToken = self.player?.addPeriodicTimeObserver(
                forInterval: interval, queue: .main
            ) { [weak self] time in

                guard let self = self else { return }
                let currentTime = time.seconds
                print(currentTime)
                // Check if current time is within any skip segment
                for segment in self.skipSegments {
                    if currentTime >= segment.startTime && currentTime < segment.endTime {
                        // Emit event to JS and skip to end of segment
                        //                        self.sendEvent("onSkipSegmentReached", [
                        //                            "startTime": segment.startTime,
                        //                            "endTime": segment.endTime
                        //                        ])
                        print("skipidoooooo")
                        self.player?.seek(
                            to: CMTime(
                                seconds: segment.endTime,
                                preferredTimescale: CMTimeScale(NSEC_PER_SEC)))
                        break
                    }
                }

                // Get first episode and update its metadata with current playback time
                let episodeResult = self.getFirstEpisode()
                switch episodeResult {
                case .success(let firstEpisode):
                    let metadataRepo = EpisodeMetadataRepository()
                    if var metadata = metadataRepo.getMetadataForEpisode(
                        episodeIdValue: firstEpisode.id)
                    {
                        metadata = EpisodeMetadata(
                            episodeId: metadata.episodeId,
                            playback: Int64(currentTime),
                            isFinished: metadata.isFinished,
                            downloadProgress: metadata.downloadProgress,
                            fileSize: metadata.fileSize,
                            filePath: metadata.filePath
                        )
                        metadataRepo.createOrUpdateMetadata(metadata)
                    }
                case .failure:
                    break
                }

                // Emit playback status
                self.sendEvent(
                    "onPlaybackStatusUpdate",
                    [
                        "isPlaying": self.player?.rate != 0,
                        "currentTime": currentTime,
                        "duration": self.player?.currentItem?.duration.seconds ?? 0,
                    ])
            }

            promise.resolve()
        }

        // Playback control functions
        AsyncFunction("play") { (promise: Promise) in
            let metadataRepo = EpisodeMetadataRepository()

            // Get first episode using the reusable function
            let episodeResult = self.getFirstEpisode()
            switch episodeResult {
            case .failure(let error):
                promise.reject(error)
                return
            case .success(let firstEpisode):
                // Get or create episode metadata
                var metadata = metadataRepo.getMetadataForEpisode(episodeIdValue: firstEpisode.id)
                if metadata == nil {
                    let newMetadata = EpisodeMetadata(
                        episodeId: firstEpisode.id,
                        playback: 0,
                        isFinished: false,
                        downloadProgress: 0,
                        fileSize: nil,
                        filePath: nil
                    )
                    metadataRepo.createOrUpdateMetadata(newMetadata)
                }

                self.player?.play()
                promise.resolve()
            }
        }

        AsyncFunction("pause") { (promise: Promise) in
            self.player?.pause()
            promise.resolve()
        }

        AsyncFunction("seekTo") { (position: Double, promise: Promise) in
            let time = CMTime(seconds: position, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
            self.player?.seek(to: time)
            promise.resolve()
        }

        // Update skip segments during playback
        Function("updateSkipSegments") { (segments: [SkipSegment]) in
            self.skipSegments = segments
        }

        // Cleanup
        Function("cleanup") {
            if let token = self.timeObserverToken {
                self.player?.removeTimeObserver(token)
                self.timeObserverToken = nil
            }
            self.player = nil
            self.skipSegments = []
        }
    }

    enum PlaybackError: LocalizedError {
        case invalidUrl
        case noPodcastFound
        case noEpisodeFound

        var errorDescription: String? {
            switch self {
            case .invalidUrl:
                return "Invalid URL provided"
            case .noPodcastFound:
                return "No podcast found"
            case .noEpisodeFound:
                return "No episode found"
            }
        }
    }
}
