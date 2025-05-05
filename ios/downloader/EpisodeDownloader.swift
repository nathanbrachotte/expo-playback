import BackgroundTasks
import Foundation

public class EpisodeDownloader: NSObject, URLSessionDownloadDelegate {
    public static let shared = EpisodeDownloader()
    private let episodeRepo: EpisodeRepository = EpisodeRepository()
    private let metadataRepo: EpisodeMetadataRepository = EpisodeMetadataRepository()
    
    private let backgroundTaskIdentifier = "expo.modules.playback.example.fetch"
    private let db = SQLiteManager.shared.getDB()
    private var urlSession: URLSession!
    
    override init() {
        super.init()
        self.urlSession = URLSession(configuration: .default, delegate: self, delegateQueue: nil)
    }
        
    public func downloadEpisode(episodeId: Int64) {
        let episode = episodeRepo.getEpisodeById(episodeIdValue: episodeId)
        let downloadUrl = episode!.downloadUrl
        let downloadTask = urlSession.downloadTask(with: URL(string: downloadUrl)!)
        downloadTask.taskDescription = String(episodeId)
        downloadTask.resume()
    }
    
    public func urlSession(
        _ session: URLSession, downloadTask: URLSessionDownloadTask,
        didFinishDownloadingTo location: URL
    ) {
        guard let episodeId = Int64(downloadTask.taskDescription ?? "") else { return }
        
        print(episodeId)
        print(location)
        
        let episode = episodeRepo.getEpisodeById(episodeIdValue: episodeId)
        
        do {
            let documentsURL = try FileManager.default.url(for: .documentDirectory,
                                                           in: .userDomainMask,
                                                           appropriateFor: nil,
                                                           create: false)
            
            // Generate a random filename
            let randomString = UUID().uuidString
            let fileExtension = URL(string: episode!.downloadUrl)?.pathExtension ?? "mp3"
            let savedURL = documentsURL.appendingPathComponent("\(randomString).\(fileExtension)")
            
            do {
                try FileManager.default.moveItem(at: location, to: savedURL)
                
                // Get the actual file size after moving
                let fileAttributes = try FileManager.default.attributesOfItem(atPath: savedURL.path)
                let fileSize = fileAttributes[.size] as? Int64 ?? 0
                
                // Update episode metadata with new file location and state
                self.metadataRepo.createOrUpdateMetadata(
                    EpisodeMetadata(
                        episodeId: episodeId,
                        playback: 0,
                        isFinished: false,
                        downloadProgress: 100,
                        fileSize: fileSize,
                        filePath: savedURL.absoluteString
                    )
                )
            } catch {
                // handle filesystem error
            }
        } catch let error {
            print(error)
            return
        }
    }
    
    public func urlSession(_ session: URLSession,
                           downloadTask: URLSessionDownloadTask,
                           didWriteData bytesWritten: Int64,
                           totalBytesWritten: Int64,
                           totalBytesExpectedToWrite: Int64) {
        
        let calculatedProgress = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
        print(NSNumber(value: calculatedProgress))
    }
    
    public func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
        if let error = error {
            print("Download failed: \(error)")
        }
    }
}
