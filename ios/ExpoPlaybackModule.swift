import AVFoundation
import ExpoModulesCore
import MediaPlayer

struct SkipSegment: Record {
    @Field var startTime: Double
    @Field var endTime: Double
}

// see https://medium.com/@afridi.khondakar/implementing-background-play-picture-in-picture-in-swiftui-building-a-video-streaming-app-with-141304b84728 for more customizations

public class ExpoPlaybackModule: Module, EpisodeDownloaderDelegate {
    private var player: AVPlayer?
    private var currentEpisodeId: Int64?
    private var skipSegments: [SkipSegment] = []
    private var timeObserverToken: Any?
    
    private func startBackgroundDownload(episodeId: Int64) {
        EpisodeDownloader.shared.episodeDownloaderDelegate = self
        EpisodeDownloader.shared.downloadEpisode(episodeId: episodeId)
    }
    
    // EpisodeDownloaderDelegate implementation
    public func episodeDownloadProgress(episodeId: Int64, currentProgress: NSNumber) {
        self.sendEpisodeMetadataUpdate()
    }
    
    public func episodeDownloadFinished(episodeId: Int64) {
        self.sendEpisodeMetadataUpdate()
    }
    
    private func sendEpisodeMetadataUpdate() {
        self.sendEvent(
            "onSqLiteTableUpdate",
            [
                "table": "episode_metadata"
            ])
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
        Events("onPlaybackStatusUpdate", "onSkipSegmentReached", "onSqLiteTableUpdate")
        
        // Playback control functions
        AsyncFunction("play") { (episodeId: Int64, promise: Promise) in
            do {
                try self.play(episodeId: episodeId)
            } catch {
                promise.reject(error)
            }
            promise.resolve()
        }
        
        Function("startBackgroundDownload") { (episodeId: Int64) in
            startBackgroundDownload(episodeId: episodeId)
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
    
    @objc func playerDidFinishPlaying(note: NSNotification) {
        print("episode finished ", self.currentEpisodeId!)
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
    
    func initPlayer () {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .default, policy: .default, options: [])
            try session.setActive(true)
            setupRemoteTransportControls()
        } catch let error {
            print(error.localizedDescription)
        }
    }
    
    private func setupRemoteTransportControls() {
        let commandCenter = MPRemoteCommandCenter.shared()
        
        // Play Command
        commandCenter.playCommand.addTarget { [weak self] event in
            guard let self = self else { return .commandFailed }
            self.player?.play()
            return .success
        }
        
        // Pause Command
        commandCenter.pauseCommand.addTarget { [weak self] event in
            guard let self = self else { return .commandFailed }
            self.player?.pause()
            return .success
        }
        
        // Toggle Play/Pause Command
        commandCenter.togglePlayPauseCommand.addTarget { [weak self] event in
            guard let self = self else { return .commandFailed }
            if self.player?.rate == 0 {
                self.player?.play()
            } else {
                self.player?.pause()
            }
            return .success
        }
        
        // Seeking Commands
        commandCenter.changePlaybackPositionCommand.addTarget { [weak self] event in
            guard let self = self,
                  let event = event as? MPChangePlaybackPositionCommandEvent else {
                return .commandFailed
            }
            let time = CMTime(seconds: event.positionTime, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
            self.player?.seek(to: time)
            return .success
        }
        
        // Skip Forward/Backward Commands
        commandCenter.skipForwardCommand.addTarget { [weak self] event in
            guard let self = self,
                  let event = event as? MPSkipIntervalCommandEvent else {
                return .commandFailed
            }
            let currentTime = self.player?.currentTime().seconds ?? 0
            let newTime = currentTime + event.interval
            let time = CMTime(seconds: newTime, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
            self.player?.seek(to: time)
            return .success
        }
        
        commandCenter.skipBackwardCommand.addTarget { [weak self] event in
            guard let self = self,
                  let event = event as? MPSkipIntervalCommandEvent else {
                return .commandFailed
            }
            let currentTime = self.player?.currentTime().seconds ?? 0
            let newTime = max(0, currentTime - event.interval)
            let time = CMTime(seconds: newTime, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
            self.player?.seek(to: time)
            return .success
        }
        
        // Set default skip intervals
        commandCenter.skipForwardCommand.preferredIntervals = [15]
        commandCenter.skipBackwardCommand.preferredIntervals = [15]
    }
    
    func play (episodeId: Int64) throws {
        self.initPlayer()
        // resume playback if the same episode is played again
        if self.currentEpisodeId == episodeId {
            self.player?.play()
            return
        }
        
        self.currentEpisodeId = episodeId
        
        let metadataRepo = EpisodeMetadataRepository()
        let episodeRepo = EpisodeRepository()
        let podcastRepo = PodcastRepository()
        
        guard let episode = episodeRepo.getEpisodeById(episodeIdValue: episodeId) else {
            throw Exception(name: "episode_not_found", description: "episode_not_found")
        }
        guard let metadata = metadataRepo.getMetadataForEpisode(episodeIdValue: episodeId) else {
            throw Exception(name: "metadata_not_found", description: "metadata_not_found")
        }
        guard let podcast = podcastRepo.getPodcastById(podcastId: episode.podcastId) else {
            throw Exception(name: "podcast_not_found", description: "podcast_not_found")
        }
        
        let playerItem = AVPlayerItem(url: URL(string: metadata.filePath!)!)
        
//        let title = AVMutableMetadataItem()
//        title.identifier = .commonIdentifierTitle
//        title.value = episode.title as NSString
//        title.extendedLanguageTag = "und"
//
//        let artist = AVMutableMetadataItem()
//        artist.identifier = .commonIdentifierArtist
//        artist.value = podcast.title as NSString
//        artist.extendedLanguageTag = "und"
//
//        let image = AVMutableMetadataItem()
//        image.identifier = .commonIdentifierArtwork
//        let imateUrlString = episode.image600 ?? episode.image100 ?? episode.image60 ?? podcast.image600 ?? podcast.image100 ?? podcast.image60
//        let imageUrl = URL(string: imateUrlString!)
//        let imageData = try? Data(contentsOf: imageUrl!)
//        image.value = UIImage(data: imageData!)!.jpegData(compressionQuality: 1.0)! as NSData
//        image.dataType = kCMMetadataBaseDataType_JPEG as String
//        image.extendedLanguageTag = "und"
//
//        playerItem.asset.metadata = [title, artist, image]
        
        self.player = AVPlayer(playerItem: playerItem)
        self.player!.actionAtItemEnd = AVPlayer.ActionAtItemEnd.none
        
        NotificationCenter.default.addObserver(self,
                                               selector: #selector(playerDidFinishPlaying),
                                               name: .AVPlayerItemDidPlayToEndTime,
                                               object: playerItem)
        
        self.player?.play()
        
        
        
        let interval = CMTime(seconds: 0.5, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
        
        self.timeObserverToken = self.player!.addPeriodicTimeObserver(
            forInterval: interval, queue: .main
        ) { [weak self] time in
            
            guard let self = self else { return }
            let currentTime = time.seconds
            
            // Check if current time is within any skip segment
            // for segment in self.skipSegments {
            //     if currentTime >= segment.startTime && currentTime < segment.endTime {
            //         // Emit event to JS and skip to end of segment
            //         //                        self.sendEvent("onSkipSegmentReached", [
            //         //                            "startTime": segment.startTime,
            //         //                            "endTime": segment.endTime
            //         //                        ])
            //         print("skipidoooooo")
            //         self.player?.seek(
            //             to: CMTime(
            //                 seconds: segment.endTime,
            //                 preferredTimescale: CMTimeScale(NSEC_PER_SEC)))
            //         break
            //     }
            // }
            
            let metadataRepo = EpisodeMetadataRepository()
            if var metadata = metadataRepo.getMetadataForEpisode(
                episodeIdValue: self.currentEpisodeId!)
            {
                metadata.playback = Int64(currentTime)
                metadataRepo.createOrUpdateMetadata(metadata)
                sendEpisodeMetadataUpdate()
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
        
    }
    
    deinit {
        NotificationCenter.default.removeObserver(self)
    }
}
