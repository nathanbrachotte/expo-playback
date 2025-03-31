import SQLite

struct EpisodeMetadata {
    let episodeId: Int64
    let playback: Int64
    let isFinished: Bool
    let downloadProgress: Int64
    let fileSize: Int64?
    let filePath: String?
}

class EpisodeMetadataRepository {
    private let db = SQLiteManager.shared.getDB()
    
    private let episodeMetadata = Table("episode_metadata")
    private let episodeId = Expression<Int64>("episode_id")
    private let playback = Expression<Int64>("playback")
    private let isFinished = Expression<Bool>("is_finished")
    private let downloadProgress = Expression<Int64>("download_progress")
    private let fileSize = Expression<Int64?>("file_size")
    private let filePath = Expression<String?>("file_path")

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
                    filePath: row[filePath]
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
                try db.run(query.update(
                    playback <- metadata.playback,
                    isFinished <- metadata.isFinished,
                    downloadProgress <- metadata.downloadProgress,
                    fileSize <- metadata.fileSize,
                    filePath <- metadata.filePath
                ))
            } else {
                // Insert new record
                try db.run(episodeMetadata.insert(
                    episodeId <- metadata.episodeId,
                    playback <- metadata.playback,
                    isFinished <- metadata.isFinished,
                    downloadProgress <- metadata.downloadProgress,
                    fileSize <- metadata.fileSize,
                    filePath <- metadata.filePath
                ))
            }
            return metadata
        } catch {
            print("❌ Error creating/updating metadata for episode \(metadata.episodeId): \(error)")
            return nil
        }
    }
}
