import SQLite

struct EpisodeMetadata {
    var episodeId: Int64
    var playback: Int64
    var isFinished: Bool
    var downloadProgress: Int64
    var fileSize: Int64
    var relativeFilePath: String?
    var duration: Int64

    init(
        episodeId: Int64,
        playback: Int64 = 0,
        isFinished: Bool = false,
        downloadProgress: Int64 = 0,
        fileSize: Int64 = 0,
        relativeFilePath: String? = nil,
        duration: Int64 = 0
    ) {
        self.episodeId = episodeId
        self.playback = playback
        self.isFinished = isFinished
        self.downloadProgress = downloadProgress
        self.fileSize = fileSize
        self.relativeFilePath = relativeFilePath
        self.duration = duration
    }
}

class EpisodeMetadataRepository {
    private let db = SQLiteManager.shared.getDB()

    private let episodeMetadata = Table("episode_metadata")
    private let episodeId = Expression<Int64>("episode_id")
    private let playback = Expression<Int64>("playback")
    private let isFinished = Expression<Bool>("is_finished")
    private let downloadProgress = Expression<Int64>("download_progress")
    private let fileSize = Expression<Int64>("file_size")
    private let relativeFilePath = Expression<String?>("relative_file_path")
    private let duration = Expression<Int64>("duration")

    func getMetadataForEpisode(episodeIdValue: Int64) -> EpisodeMetadata? {
        guard let db = db else { return nil }

        do {
            let query = episodeMetadata.filter(episodeId == episodeIdValue)
            if let row = try db.pluck(query) {
                return EpisodeMetadata(
                    episodeId: row[episodeId],
                    playback: row[playback],
                    isFinished: row[isFinished],
                    downloadProgress: row[downloadProgress],
                    fileSize: row[fileSize],
                    relativeFilePath: row[relativeFilePath],
                    duration: row[duration]
                )
            }
        } catch {
            print("❌ Error fetching metadata for episode \(episodeIdValue): \(error)")
        }

        return nil
    }

    @discardableResult
    func createOrUpdateMetadata(_ metadata: EpisodeMetadata) -> EpisodeMetadata? {
        guard let db = db else { return nil }

        do {
            let query = episodeMetadata.filter(episodeId == metadata.episodeId)

            // Check if record exists
            if try db.pluck(query) != nil {
                // Update existing record
                try db.run(
                    query.update(
                        playback <- metadata.playback,
                        isFinished <- metadata.isFinished,
                        downloadProgress <- metadata.downloadProgress,
                        fileSize <- metadata.fileSize,
                        relativeFilePath <- metadata.relativeFilePath,
                        duration <- metadata.duration
                    ))
            } else {
                // Insert new record
                try db.run(
                    episodeMetadata.insert(
                        episodeId <- metadata.episodeId,
                        playback <- metadata.playback,
                        isFinished <- metadata.isFinished,
                        downloadProgress <- metadata.downloadProgress,
                        fileSize <- metadata.fileSize,
                        relativeFilePath <- metadata.relativeFilePath,
                        duration <- metadata.duration
                    ))
            }
            return metadata
        } catch {
            print("❌ Error creating/updating metadata for episode \(metadata.episodeId): \(error)")
            return nil
        }
    }

    @discardableResult
    func delete(episodeIdValue: Int64) -> Bool {
        guard let db = db else { return false }

        do {
            let query = episodeMetadata.filter(episodeId == episodeIdValue)
            try db.run(query.delete())
            return true
        } catch {
            print("❌ Error deleting metadata for episode \(episodeIdValue): \(error)")
            return false
        }
    }

    @discardableResult
    func resetAllPartialDownloads() -> Bool {
        guard let db = db else { return false }

        do {
            let query = episodeMetadata.filter(
                (downloadProgress > 0 && downloadProgress < 100) || relativeFilePath == nil
                    || fileSize == 0)
            try db.run(
                query.update(
                    downloadProgress <- 0,
                    fileSize <- 0,
                    relativeFilePath <- nil,
                    duration <- 0
                ))
            return true
        } catch {
            print("❌ Error resetting partial downloads: \(error)")
            return false
        }
    }
}
