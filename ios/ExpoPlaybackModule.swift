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

    private let metadataRepo = EpisodeMetadataRepository()
    private let episodeRepo = EpisodeRepository()
    private let podcastRepo = PodcastRepository()
    private let episodeDownloader = EpisodeDownloader.shared

    private func startBackgroundDownload(episodeId: Int64) {
        episodeDownloader.episodeDownloaderDelegate = self
        episodeDownloader.downloadEpisode(episodeId: episodeId)
    }

    // EpisodeDownloaderDelegate implementation
    public func episodeDownloadProgress(episodeId: Int64, currentProgress: NSNumber) {
        self.sendEpisodeMetadataUpdateDownloadProgress(episodeId: episodeId, downloadProgress: currentProgress.doubleValue)
    }

    public func episodeDownloadStarted(episodeId: Int64) {
        self.sendCoreEpisodeMetadataUpdate(episodeId: episodeId)
    }

    public func episodeDownloadFinished(episodeId: Int64) {
        self.sendEpisodeMetadataUpdateDownloadProgress(episodeId: episodeId, downloadProgress: 100)
        self.sendCoreEpisodeMetadataUpdate(episodeId: episodeId)
    }

    private func sendEpisodeMetadataUpdateDownloadProgress(episodeId: Int64, downloadProgress: Double) {
        self.sendEvent(
            "onEpisodeMetadataUpdateDownloadProgress",
            [
                "episodeId": episodeId,
                "downloadProgress": downloadProgress
            ])
    }

    private func sendEpisodeMetadataUpdatePlayback(episodeId: Int64, playback: Double) {
        self.sendEvent(
            "onEpisodeMetadataUpdatePlayback",
            [
                "episodeId": episodeId,
                "playback": playback
            ])
    }

    private func sendCoreEpisodeMetadataUpdate(episodeId: Int64) {
        self.sendEvent(
            "onCoreEpisodeMetadataUpdate",
            [
                "episodeId": episodeId
            ])
    }
    
    private func sendPlayerStateUpdate() {
        self.sendEvent(
            "onPlayerStateUpdate",
            self.getState())
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
        Events("onPlayerStateUpdate", "onSkipSegmentReached", "onSqLiteTableUpdate", "onEpisodeMetadataUpdateDownloadProgress", "onEpisodeMetadataUpdatePlayback", "onCoreEpisodeMetadataUpdate")

        // Playback control functions
        Function("play") { (episodeId: Int64) in
            try self.play(episodeId: episodeId)
        }

        Function("getState") { () in
            return self.getState()
        }

        Function("startBackgroundDownload") { (episodeId: Int64) in
            startBackgroundDownload(episodeId: episodeId)
        }

        Function("pause") { () in
            self.pause()
        }

        Function("stop") { () in
            self.stop()
        }

        Function("skip") { (seconds: Double) in
            self.skip(seconds)
        }

        Function("seek") { (position: Double) in
            self.seek(position)
        }

        // Update skip segments during playback
        Function("updateSkipSegments") { (segments: [SkipSegment]) in
            self.skipSegments = segments
        }

        AsyncFunction("deleteEpisodeAudioFileAndMetadata") { (episodeId: Int64, promise: Promise) in
            if let metadata = self.metadataRepo.getMetadataForEpisode(episodeIdValue: episodeId),
                let relativeFilePath = metadata.relativeFilePath
            {
                do {
                    // Delete the downloaded file if it exists
                    let fileURL = try EpisodeDownloader.getEpisodeFileURL(
                        relativeFilePath: relativeFilePath)
                    try? FileManager.default.removeItem(at: fileURL)

                    // Delete metadata from database
                    self.metadataRepo.delete(episodeIdValue: episodeId)
                    self.sendCoreEpisodeMetadataUpdate(episodeId: episodeId)
                    promise.resolve()
                } catch {
                    print("Error deleting episode: \(error)")
                    promise.reject(error)
                }
            } else {
                promise.resolve()
            }
            
        }

        // Restart incomplete downloads by removing partial file and starting fresh
        Function("restartDownload") { (episodeId: Int64) in
            if let metadata = self.metadataRepo.getMetadataForEpisode(episodeIdValue: episodeId),
                let relativeFilePath = metadata.relativeFilePath
            {

                do {
                    // Try to delete the partial download file if it exists
                    let fileURL = try EpisodeDownloader.getEpisodeFileURL(
                        relativeFilePath: relativeFilePath)
                    try? FileManager.default.removeItem(at: fileURL)

                    // Reset metadata download progress
                    var updatedMetadata = metadata
                    updatedMetadata.downloadProgress = 0
                    updatedMetadata.relativeFilePath = nil
                    updatedMetadata.fileSize = 0
                    self.metadataRepo.createOrUpdateMetadata(updatedMetadata)

                    // Start fresh download
                    startBackgroundDownload(episodeId: episodeId)
                } catch {
                    print("Error restarting download: \(error)")
                }
            }
        }
    }

    func cleanup() {
        self.player?.pause()
        if let token = self.timeObserverToken {
            self.player?.removeTimeObserver(token)
            self.timeObserverToken = nil
        }
        self.currentEpisodeId = nil
        self.player = nil
        self.skipSegments = []

        // Clean up MPRemoteCommandCenter
        let commandCenter = MPRemoteCommandCenter.shared()
        commandCenter.playCommand.removeTarget(nil)
        commandCenter.pauseCommand.removeTarget(nil)
        commandCenter.togglePlayPauseCommand.removeTarget(nil)
        commandCenter.changePlaybackPositionCommand.removeTarget(nil)
        commandCenter.skipForwardCommand.removeTarget(nil)
        commandCenter.skipBackwardCommand.removeTarget(nil)

        // Clear now playing info
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
    }

    @objc func playerDidFinishPlaying(note: NSNotification) {
        print("episode finished ", self.currentEpisodeId!)
        self.currentEpisodeId = nil
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

    func initPlayer() {
        do {
            let session = AVAudioSession.sharedInstance()
            try session.setCategory(.playback, mode: .default, policy: .default, options: [])
            try session.setActive(true)
        } catch let error {
            print(error.localizedDescription)
        }
    }

    private func setupRemoteTransportControls() {
        let commandCenter = MPRemoteCommandCenter.shared()

        // Play Command
        commandCenter.playCommand.isEnabled = true
        commandCenter.playCommand.addTarget { [weak self] event in
            guard let self = self else { return .commandFailed }
            self.play()
            return .success
        }

        // Pause Command
        commandCenter.pauseCommand.isEnabled = true
        commandCenter.pauseCommand.addTarget { [weak self] event in
            guard let self = self else { return .commandFailed }
            self.pause()
            return .success
        }

        // Toggle Play/Pause Command
        commandCenter.togglePlayPauseCommand.isEnabled = true
        commandCenter.togglePlayPauseCommand.addTarget { [weak self] event in
            guard let self = self else { return .commandFailed }
            if self.player?.rate == 0 {
                self.play()
            } else {
                self.pause()
            }
            return .success
        }

        // Seeking Commands
        commandCenter.changePlaybackPositionCommand.isEnabled = true
        commandCenter.changePlaybackPositionCommand.addTarget { [weak self] event in
            guard let self = self,
                let event = event as? MPChangePlaybackPositionCommandEvent
            else {
                return .commandFailed
            }
            let time = CMTime(
                seconds: event.positionTime, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
            self.player?.seek(to: time)
            return .success
        }

        // Skip Forward/Backward Commands
        commandCenter.skipForwardCommand.isEnabled = true
        commandCenter.skipForwardCommand.addTarget { [weak self] event in
            guard let self = self,
                let event = event as? MPSkipIntervalCommandEvent
            else {
                return .commandFailed
            }

            self.skip(event.interval)
            return .success
        }
        commandCenter.skipBackwardCommand.isEnabled = true
        commandCenter.skipBackwardCommand.addTarget { [weak self] event in
            guard let self = self,
                let event = event as? MPSkipIntervalCommandEvent
            else {
                return .commandFailed
            }

            self.skip(-1 * event.interval)
            return .success
        }

        // Set default skip intervals
        commandCenter.skipForwardCommand.preferredIntervals = [15]
        commandCenter.skipBackwardCommand.preferredIntervals = [15]
    }

    func getState() -> [String: Any?] {
        guard player != nil else {
            return [
                "status": "stopped",
                "currentEpisodeId": nil,
                "currentTime": 0.0,
            ]
        }

        let status: String
        switch self.player?.timeControlStatus {
        case .playing:
            status = "playing"
        case .paused:
            status = "paused"
        case .waitingToPlayAtSpecifiedRate:
            status = "buffering"
        case .none:
            status = "stopped"
        case .some(_):
            status = "stopped"
        }

        let currentTime = self.player?.currentTime().seconds ?? 0.0

        return [
            "status": status,
            "currentEpisodeId": self.currentEpisodeId,
            "currentTime": currentTime,
        ]
    }

    func skip(seconds: Double) {
        let currentTime = self.player?.currentTime().seconds ?? 0
        let newTime = currentTime + seconds
        let time = CMTime(seconds: newTime, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
        self.player?.seek(to: time)

        // Update now playing info
        var nowPlayingInfo = MPNowPlayingInfoCenter.default().nowPlayingInfo ?? [:]
        nowPlayingInfo[MPNowPlayingInfoPropertyElapsedPlaybackTime] = newTime
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo
    }

    func play(episodeId: Int64) throws {
        self.initPlayer()
        // resume playback if the same episode is played again
        if self.currentEpisodeId == episodeId {
            self.player?.play()
            return
        }

        self.currentEpisodeId = episodeId

        guard let episode = episodeRepo.getEpisodeById(episodeIdValue: episodeId) else {
            throw Exception(name: "episode_not_found", description: "episode_not_found")
        }
        guard let metadata = metadataRepo.getMetadataForEpisode(episodeIdValue: episodeId) else {
            throw Exception(name: "metadata_not_found", description: "metadata_not_found")
        }
        guard let podcast = podcastRepo.getPodcastById(podcastId: episode.podcastId) else {
            throw Exception(name: "podcast_not_found", description: "podcast_not_found")
        }

        guard
            let episodeFileURL = try? EpisodeDownloader.getEpisodeFileURL(
                relativeFilePath: metadata.relativeFilePath!)
        else {
            throw Exception(name: "podcast_not_downloaded", description: "podcast_not_downloaded")
        }

        let playerItem = AVPlayerItem(url: episodeFileURL)

        // Set up now playing info
        var nowPlayingInfo = [String: Any]()
        nowPlayingInfo[MPMediaItemPropertyTitle] = episode.title
        nowPlayingInfo[MPMediaItemPropertyArtist] = podcast.title

        // Set the now playing info
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo

        self.player = AVPlayer(playerItem: playerItem)

        // Load duration asynchronously
        Task {
            do {
                let duration = try await playerItem.asset.load(.duration)
                var updatedInfo = MPNowPlayingInfoCenter.default().nowPlayingInfo ?? [:]
                updatedInfo[MPMediaItemPropertyPlaybackDuration] = duration.seconds
                MPNowPlayingInfoCenter.default().nowPlayingInfo = updatedInfo
            } catch {
                print("Error loading asset duration: \(error)")
            }
        }

        // Load artwork asynchronously
        Task {
            do {
                let imageUrlString =
                    episode.image600 ?? episode.image100 ?? episode.image60 ?? podcast.image600
                    ?? podcast.image100 ?? podcast.image60
                if let imageUrl = URL(string: imageUrlString!) {
                    let (imageData, _) = try await URLSession.shared.data(from: imageUrl)
                    if let uiImage = UIImage(data: imageData) {
                        let artwork = MPMediaItemArtwork(boundsSize: uiImage.size) { _ in uiImage }
                        var updatedInfo = MPNowPlayingInfoCenter.default().nowPlayingInfo ?? [:]
                        updatedInfo[MPMediaItemPropertyArtwork] = artwork
                        MPNowPlayingInfoCenter.default().nowPlayingInfo = updatedInfo
                    }
                }
            } catch {
                print("Error loading artwork: \(error)")
            }
        }

        NotificationCenter.default.addObserver(
            self,
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

            let duration = self.player?.currentItem?.duration.seconds ?? 0

            if var metadata = metadataRepo.getMetadataForEpisode(
                episodeIdValue: self.currentEpisodeId!)
            {
                if !metadata.isFinished {
                    let progress = (currentTime / duration) * 100
                    if progress >= 95 {
                        metadata.isFinished = true
                    }
                }

                metadata.playback = Int64(currentTime)
                metadataRepo.createOrUpdateMetadata(metadata)
            }

            self.sendPlayerStateUpdate()
            self.sendEpisodeMetadataUpdatePlayback(episodeId: self.currentEpisodeId!, playback: currentTime)
        }

        setupRemoteTransportControls()

    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    // Add these new class functions for player state management
    private func play() {
        self.player?.play()
        self.sendPlayerStateUpdate()
    }

    private func pause() {
        self.player?.pause()
        self.sendPlayerStateUpdate()
    }

    private func stop() {
        self.cleanup()
        self.sendPlayerStateUpdate()
    }

    private func seek(_ position: Double) {
        let time = CMTime(seconds: position, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
        self.player?.seek(to: time)
        self.sendPlayerStateUpdate()
    }

    private func skip(_ seconds: Double) {
        let currentTime = self.player?.currentTime().seconds ?? 0
        let newTime = currentTime + seconds
        let time = CMTime(seconds: newTime, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
        self.player?.seek(to: time)

        // Update now playing info
        var nowPlayingInfo = MPNowPlayingInfoCenter.default().nowPlayingInfo ?? [:]
        nowPlayingInfo[MPNowPlayingInfoPropertyElapsedPlaybackTime] = newTime
        MPNowPlayingInfoCenter.default().nowPlayingInfo = nowPlayingInfo

        self.sendPlayerStateUpdate()
    }
}
