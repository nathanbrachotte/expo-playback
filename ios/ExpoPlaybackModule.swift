import ExpoModulesCore
import AVFoundation

struct SkipSegment: Record {
    @Field var startTime: Double
    @Field var endTime: Double
}

public class ExpoPlaybackModule: Module {
    private var player: AVPlayer?
    private var skipSegments: [SkipSegment] = []
    private var timeObserverToken: Any?
    
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
        AsyncFunction("initializePlayer") { (url: String, segments: [SkipSegment], promise: Promise) in
            print("I AM HERE")
            guard let audioUrl = URL(string: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3") else {
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
            self.timeObserverToken = self.player?.addPeriodicTimeObserver(forInterval: interval, queue: .main) { [weak self] time in
                
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
                        self.player?.seek(to: CMTime(seconds: segment.endTime, preferredTimescale: CMTimeScale(NSEC_PER_SEC)))
                        break
                    }
                }
                
                // Emit playback status
                self.sendEvent("onPlaybackStatusUpdate", [
                    "isPlaying": self.player?.rate != 0,
                    "currentTime": currentTime,
                    "duration": self.player?.currentItem?.duration.seconds ?? 0
                ])
            }
            
            promise.resolve()
        }
        
        // Playback control functions
        AsyncFunction("play") { (promise: Promise) in
            self.player?.play()
            promise.resolve()
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
        
        var errorDescription: String? {
            switch self {
            case .invalidUrl:
                return "Invalid URL provided"
            }
        }
    }
}
