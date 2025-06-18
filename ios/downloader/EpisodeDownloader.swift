import BackgroundTasks
import Foundation

public protocol EpisodeDownloaderDelegate {
    func episodeDownloadProgress(episodeId: Int64, currentProgress: NSNumber)
    func episodeDownloadFinished(episodeId: Int64)
}

public class EpisodeDownloader: NSObject, URLSessionDownloadDelegate {
    public static let shared = EpisodeDownloader()

    public static func getEpisodeFileURL(relativeFilePath: String) throws -> URL {
        let documentsURL = try FileManager.default.url(
            for: .documentDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: false)

        return documentsURL.appendingPathComponent(relativeFilePath)
    }
    public var episodeDownloaderDelegate: EpisodeDownloaderDelegate?
    private let episodeRepo: EpisodeRepository = EpisodeRepository()
    private let metadataRepo: EpisodeMetadataRepository = EpisodeMetadataRepository()

    private let backgroundTaskIdentifier = "expo.modules.playback.example.fetch"
    private let db = SQLiteManager.shared.getDB()
    private var urlSession: URLSession!

    override init() {
        super.init()
        self.urlSession = URLSession(
            configuration: URLSessionConfiguration.background(
                withIdentifier: self.backgroundTaskIdentifier), delegate: self, delegateQueue: nil)
        self.metadataRepo.resetAllPartialDownloads()
        self.resumePendingDownloads()
    }

    private func resumePendingDownloads() {
        let episodes = episodeRepo.getEpisodesToDownload()
        for episode in episodes {
            downloadEpisode(episodeId: episode.id)
        }
    }

    public func downloadEpisode(episodeId: Int64) {
        if let metadata = metadataRepo.getMetadataForEpisode(episodeIdValue: episodeId) {
            if metadata.downloadProgress == 100 || metadata.downloadProgress > 0 {
                return
            }
        }

        let episode = episodeRepo.getEpisodeById(episodeIdValue: episodeId)
        let downloadUrl = episode!.downloadUrl
        let downloadTask = urlSession.downloadTask(with: URL(string: downloadUrl)!)
        downloadTask.taskDescription = String(episodeId)
        downloadTask.resume()
        self.metadataRepo.createOrUpdateMetadata(
            EpisodeMetadata(
                episodeId: episodeId,
                playback: 0,
                isFinished: false,
                downloadProgress: 0,
                fileSize: nil,
                relativeFilePath: nil
            )
        )
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
            // Generate a random filename
            let randomString = UUID().uuidString
            let fileExtension = URL(string: episode!.downloadUrl)?.pathExtension ?? "mp3"
            let fileName = "\(randomString).\(fileExtension)"
            let episodeFileURL = try EpisodeDownloader.getEpisodeFileURL(relativeFilePath: fileName)

            do {
                try FileManager.default.moveItem(at: location, to: episodeFileURL)

                // Get the actual file size after moving
                let fileAttributes = try FileManager.default.attributesOfItem(
                    atPath: episodeFileURL.path)
                let fileSize = fileAttributes[.size] as? Int64 ?? 0

                // Update episode metadata with new file location and state
                self.metadataRepo.createOrUpdateMetadata(
                    EpisodeMetadata(
                        episodeId: episodeId,
                        playback: 0,
                        isFinished: false,
                        downloadProgress: 100,
                        fileSize: fileSize,
                        relativeFilePath: fileName
                    )
                )

                episodeDownloaderDelegate?.episodeDownloadFinished(episodeId: episodeId)
            } catch {
                // handle filesystem error
            }
        } catch let error {
            print(error)
            return
        }
    }

    public func urlSession(
        _ session: URLSession,
        downloadTask: URLSessionDownloadTask,
        didWriteData bytesWritten: Int64,
        totalBytesWritten: Int64,
        totalBytesExpectedToWrite: Int64
    ) {

        let calculatedProgress = Float(totalBytesWritten) / Float(totalBytesExpectedToWrite)
        let progress = NSNumber(value: calculatedProgress)

        if let episodeId = Int64(downloadTask.taskDescription ?? "") {
            if var metadata = metadataRepo.getMetadataForEpisode(episodeIdValue: episodeId) {
                let newProgress = Int64(progress.doubleValue * 100)
                if metadata.downloadProgress >= newProgress { return }
                metadata.downloadProgress = newProgress
                metadataRepo.createOrUpdateMetadata(metadata)

                episodeDownloaderDelegate?.episodeDownloadProgress(
                    episodeId: episodeId, currentProgress: progress)
            }
        }

    }

    public func urlSession(
        _ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?
    ) {
        if let error = error {
            print("Download failed: \(error)")
        }
    }
}
