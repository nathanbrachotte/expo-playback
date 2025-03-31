import BackgroundTasks
import Foundation

class EpisodeDownloader: NSObject, URLSessionDownloadDelegate {
  private let episodeRepo: EpisodeRepository = EpisodeRepository()
  private let metadataRepo: EpisodeMetadataRepository = EpisodeMetadataRepository()
  private let downloadQueue = OperationQueue()
  private let backgroundTaskIdentifier = "com.purecast.episodedownload"
  private let db = SQLiteManager.shared.getDB()
  private var backgroundSession: URLSession!

  override init() {
    super.init()
    self.downloadQueue.maxConcurrentOperationCount = 1
    setupBackgroundSession()
    setupBackgroundTask()
  }

  private func setupBackgroundSession() {
    let config = URLSessionConfiguration.background(withIdentifier: "com.purecast.download")
    backgroundSession = URLSession(configuration: config, delegate: self, delegateQueue: nil)
  }

  private func setupBackgroundTask() {
    BGTaskScheduler.shared.register(
      forTaskWithIdentifier: backgroundTaskIdentifier,
      using: nil
    ) { task in
      self.handleBackgroundDownload(task: task as! BGProcessingTask)
    }
  }

  private func handleBackgroundDownload(task: BGProcessingTask) {
    // Create a task expiration handler
    task.expirationHandler = {
      self.downloadQueue.cancelAllOperations()
    }

    // Find next episode to download
    guard let nextEpisode = findNextEpisodeToDownload() else {
      task.setTaskCompleted(success: true)
      return
    }

    let downloadOperation = createDownloadOperation(for: nextEpisode)

    downloadOperation.completionBlock = {
      task.setTaskCompleted(success: !downloadOperation.isCancelled)
      self.scheduleNextDownload()
    }

    downloadQueue.addOperation(downloadOperation)
  }

  private func findNextEpisodeToDownload() -> Episode? {
    do {
      // Get the next episode that hasn't been downloaded yet (where metadata doesn't exist or download_progress < 100)
      let query = """
            SELECT episodes.id 
            FROM episodes 
            LEFT JOIN episode_metadata ON episodes.id = episode_metadata.episode_id
            WHERE episodes.should_download = 1 AND (episode_metadata.episode_id IS NULL 
               OR episode_metadata.download_progress < 100)
            LIMIT 1
        """
      guard let nextDownloadEpisodeId = try db?.scalar(query) as? Int64 else { return nil }
      return self.episodeRepo.getEpisodeById(episodeIdValue: nextDownloadEpisodeId)
    } catch {
      print("Error finding next episode: \(error)")
      return nil
    }
  }

  private func createDownloadOperation(for episode: Episode) -> Operation {
    return BlockOperation { [weak self] in
      guard let self = self else { return }
      guard let url = URL(string: episode.downloadUrl) else { return }
      let task = self.backgroundSession.downloadTask(with: url)
      task.taskDescription = String(episode.id)  // Store episode ID for reference
      task.resume()
    }
  }

  func scheduleNextDownload() {
    // Start the next download immediately if there's one available
    if let nextEpisode = findNextEpisodeToDownload() {
      let downloadOperation = createDownloadOperation(for: nextEpisode)
      downloadQueue.addOperation(downloadOperation)
    }

    // Also schedule future background task
    let request = BGProcessingTaskRequest(identifier: backgroundTaskIdentifier)
    request.requiresNetworkConnectivity = true
    request.requiresExternalPower = false

    do {
      try BGTaskScheduler.shared.submit(request)
    } catch {
      print("Could not schedule background download: \(error)")
    }
  }

  // MARK: - URLSessionDownloadDelegate Methods

  func urlSession(
    _ session: URLSession, downloadTask: URLSessionDownloadTask,
    didFinishDownloadingTo location: URL
  ) {
    guard let episodeId = Int64(downloadTask.taskDescription ?? ""),
      let response = downloadTask.response as? HTTPURLResponse
    else { return }

    // Update episode metadata with new file location and state
    self.metadataRepo.createOrUpdateMetadata(
      EpisodeMetadata(
        episodeId: episodeId,
        playback: 0,
        isFinished: false,
        downloadProgress: 100,
        fileSize: response.expectedContentLength,
        filePath: location.absoluteString
      )
    )

    self.scheduleNextDownload()
  }

  func urlSession(_ session: URLSession, task: URLSessionTask, didCompleteWithError error: Error?) {
    if let error = error {
      print("Download failed: \(error)")
    }
  }
}
