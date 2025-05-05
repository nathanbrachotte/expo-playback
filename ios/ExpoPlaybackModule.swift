import AVFoundation
import ExpoModulesCore

struct SkipSegment: Record {
    @Field var startTime: Double
    @Field var endTime: Double
}

public class ExpoPlaybackModule: Module {
    private var player: AVPlayer?
    private var currentEpisodeId: Int64?
    private var skipSegments: [SkipSegment] = []
    private var timeObserverToken: Any?
    
    private func startBackgroundDownload(episodeId: Int64) {
        EpisodeDownloader.shared.downloadEpisode(episodeId: episodeId)
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

            // resume playback if the same episode is played again
            if self.currentEpisodeId == episodeId {
                self.player?.play()
                promise.resolve()
                return
            }

            let metadataRepo = EpisodeMetadataRepository()
            
            // Get first episode using the reusable function
            guard let metadata = metadataRepo.getMetadataForEpisode(episodeIdValue: episodeId) else {
                promise.reject(Exception(name: "metadata_not_found", description: "metadata_not_found"))
                return
            }

            let playerItem = AVPlayerItem(url: URL(string: metadata.filePath!)!)
            self.player = AVPlayer(playerItem: playerItem)
            
            self.player?.play()
            
            let interval = CMTime(seconds: 0.5, preferredTimescale: CMTimeScale(NSEC_PER_SEC))
            self.timeObserverToken = self.player?.addPeriodicTimeObserver(
                forInterval: interval, queue: .main
            ) { [weak self] time in
                
                guard let self = self else { return }
                let currentTime = time.seconds
                
                guard let episodeId = self.currentEpisodeId else {return}
                
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
                        metadata = EpisodeMetadata(
                            episodeId: metadata.episodeId,
                            playback: Int64(currentTime),
                            isFinished: metadata.isFinished,
                            downloadProgress: metadata.downloadProgress,
                            fileSize: metadata.fileSize,
                            filePath: metadata.filePath
                        )
                        
                        metadataRepo.createOrUpdateMetadata(metadata)
                        
                        self.sendEvent(
                            "onSqLiteTableUpdate",
                            [
                                "table": "episode_metadata"
                            ])
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
