import SQLite

protocol FieldUpdateType {}
extension Int64: FieldUpdateType {}
extension String: FieldUpdateType {}
extension String?: FieldUpdateType {}
extension Bool: FieldUpdateType {}

enum FieldUpdate<T: FieldUpdateType> {
    case unchanged
    case setValue(T)
    case setNil

    var value: T? {
        switch self {
        case .unchanged:
            return nil
        case .setValue(let value):
            return value
        case .setNil:
            return nil
        }
    }

    func resolve(with existing: T) -> T {
        switch self {
        case .unchanged:
            return existing
        case .setValue(let value):
            return value
        case .setNil:
            // Return appropriate default values based on type
            if T.self == Int64.self {
                return 0 as! T
            } else if T.self == Bool.self {
                return false as! T
            } else if T.self == String?.self {
                let nilValue: String? = nil
                return nilValue as! T
            } else {
                // For non-optional String, return empty string
                return "" as! T
            }
        }
    }
}

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

struct PartialEpisodeMetadata {
    let episodeId: Int64
    let playback: FieldUpdate<Int64>
    let isFinished: FieldUpdate<Bool>
    let downloadProgress: FieldUpdate<Int64>
    let fileSize: FieldUpdate<Int64>
    let relativeFilePath: FieldUpdate<String?>
    let duration: FieldUpdate<Int64>

    init(
        episodeId: Int64,
        playback: FieldUpdate<Int64> = .unchanged,
        isFinished: FieldUpdate<Bool> = .unchanged,
        downloadProgress: FieldUpdate<Int64> = .unchanged,
        fileSize: FieldUpdate<Int64> = .unchanged,
        relativeFilePath: FieldUpdate<String?> = .unchanged,
        duration: FieldUpdate<Int64> = .unchanged
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

// Convenience extensions for easier usage
extension PartialEpisodeMetadata {
    // Convenience initializer for setting relativeFilePath to a specific value
    static func withFilePath(
        episodeId: Int64,
        relativeFilePath: String,
        playback: FieldUpdate<Int64> = .unchanged,
        isFinished: FieldUpdate<Bool> = .unchanged,
        downloadProgress: FieldUpdate<Int64> = .unchanged,
        fileSize: FieldUpdate<Int64> = .unchanged,
        duration: FieldUpdate<Int64> = .unchanged
    ) -> PartialEpisodeMetadata {
        return PartialEpisodeMetadata(
            episodeId: episodeId,
            playback: playback,
            isFinished: isFinished,
            downloadProgress: downloadProgress,
            fileSize: fileSize,
            relativeFilePath: .setValue(relativeFilePath),
            duration: duration
        )
    }

    // Convenience initializer for clearing relativeFilePath (set to nil)
    static func clearingFilePath(
        episodeId: Int64,
        playback: FieldUpdate<Int64> = .unchanged,
        isFinished: FieldUpdate<Bool> = .unchanged,
        downloadProgress: FieldUpdate<Int64> = .unchanged,
        fileSize: FieldUpdate<Int64> = .unchanged,
        duration: FieldUpdate<Int64> = .unchanged
    ) -> PartialEpisodeMetadata {
        return PartialEpisodeMetadata(
            episodeId: episodeId,
            playback: playback,
            isFinished: isFinished,
            downloadProgress: downloadProgress,
            fileSize: fileSize,
            relativeFilePath: .setNil,
            duration: duration
        )
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
    func createOrUpdateMetadata(_ partialMetadata: PartialEpisodeMetadata) -> EpisodeMetadata? {
        guard let db = db else { return nil }

        do {
            let query = episodeMetadata.filter(episodeId == partialMetadata.episodeId)

            if let existingRow = try db.pluck(query) {
                // Update existing record, merging with provided values
                let merged = EpisodeMetadata(
                    episodeId: partialMetadata.episodeId,
                    playback: partialMetadata.playback.resolve(with: existingRow[playback]),
                    isFinished: partialMetadata.isFinished.resolve(with: existingRow[isFinished]),
                    downloadProgress: partialMetadata.downloadProgress.resolve(
                        with: existingRow[downloadProgress]),
                    fileSize: partialMetadata.fileSize.resolve(with: existingRow[fileSize]),
                    relativeFilePath: partialMetadata.relativeFilePath.resolve(
                        with: existingRow[relativeFilePath]),
                    duration: partialMetadata.duration.resolve(with: existingRow[duration])
                )

                try db.run(
                    query.update(
                        playback <- merged.playback,
                        isFinished <- merged.isFinished,
                        downloadProgress <- merged.downloadProgress,
                        fileSize <- merged.fileSize,
                        relativeFilePath <- merged.relativeFilePath,
                        duration <- merged.duration
                    ))

                return merged
            } else {
                // Insert new record with defaults for nil values
                let defaultMetadata = EpisodeMetadata(episodeId: partialMetadata.episodeId)
                let newMetadata = EpisodeMetadata(
                    episodeId: partialMetadata.episodeId,
                    playback: partialMetadata.playback.resolve(with: defaultMetadata.playback),
                    isFinished: partialMetadata.isFinished.resolve(
                        with: defaultMetadata.isFinished),
                    downloadProgress: partialMetadata.downloadProgress.resolve(
                        with: defaultMetadata.downloadProgress),
                    fileSize: partialMetadata.fileSize.resolve(with: defaultMetadata.fileSize),
                    relativeFilePath: partialMetadata.relativeFilePath.resolve(
                        with: defaultMetadata.relativeFilePath),
                    duration: partialMetadata.duration.resolve(with: defaultMetadata.duration)
                )

                try db.run(
                    episodeMetadata.insert(
                        episodeId <- newMetadata.episodeId,
                        playback <- newMetadata.playback,
                        isFinished <- newMetadata.isFinished,
                        downloadProgress <- newMetadata.downloadProgress,
                        fileSize <- newMetadata.fileSize,
                        relativeFilePath <- newMetadata.relativeFilePath,
                        duration <- newMetadata.duration
                    ))

                return newMetadata
            }
        } catch {
            print(
                "❌ Error creating/updating metadata for episode \(partialMetadata.episodeId): \(error)"
            )
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
