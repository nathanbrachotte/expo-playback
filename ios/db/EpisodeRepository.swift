import SQLite

struct Episode {
    let id: Int64
    let podcastId: Int64
    let title: String
    let description: String
    let image30: String?
    let image60: String?
    let image100: String?
    let image600: String?
    let publishedAt: Int64
    let shouldDownload: Bool
    let downloadUrl: String
    let duration: Int64?
}

class EpisodeRepository {
    private let db = SQLiteManager.shared.getDB()

    private let episodes = Table("episodes")
    private let id = Expression<Int64>("id")
    private let podcastId = Expression<Int64>("podcast_id")
    private let title = Expression<String>("title")
    private let description = Expression<String>("description")
    private let image30 = Expression<String?>("image_30")
    private let image60 = Expression<String?>("image_60")
    private let image100 = Expression<String?>("image_100")
    private let image600 = Expression<String?>("image_600")
    private let publishedAt = Expression<Int64>("published_at")
    private let shouldDownload = Expression<Bool>("should_download")
    private let downloadUrl = Expression<String>("download_url")
    private let duration = Expression<Int64?>("duration")

    func getAllEpisodes() -> [Episode] {
        var result: [Episode] = []
        guard let db = db else { return result }

        do {
            for row in try db.prepare(episodes) {
                let episode = Episode(
                    id: row[id],
                    podcastId: row[podcastId],
                    title: row[title],
                    description: row[description],
                    image30: row[image30],
                    image60: row[image60],
                    image100: row[image100],
                    image600: row[image600],
                    publishedAt: row[publishedAt],
                    shouldDownload: row[shouldDownload],
                    downloadUrl: row[downloadUrl],
                    duration: row[duration]
                )
                result.append(episode)
            }
        } catch {
            print("❌ Error fetching episodes: \(error)")
        }

        return result
    }

    func getEpisodesByPodcastId(podcastIdValue: Int64) -> [Episode] {
        var result: [Episode] = []
        guard let db = db else { return result }

        do {
            let query = episodes.filter(podcastId == podcastIdValue)
            for row in try db.prepare(query) {
                let episode = Episode(
                    id: row[id],
                    podcastId: row[podcastId],
                    title: row[title],
                    description: row[description],
                    image30: row[image30],
                    image60: row[image60],
                    image100: row[image100],
                    image600: row[image600],
                    publishedAt: row[publishedAt],
                    shouldDownload: row[shouldDownload],
                    downloadUrl: row[downloadUrl],
                    duration: row[duration]
                )
                result.append(episode)
            }
        } catch {
            print("❌ Error fetching episodes for podcast \(podcastIdValue): \(error)")
        }

        return result
    }
    
    func getEpisodeById(episodeIdValue: Int64) -> Episode? {
        guard let db = db else { return nil }
        do {
            let query = episodes.filter(id == episodeIdValue)
            guard let row = try db.prepare(query).makeIterator().next() else {return nil}
            return Episode(
                    id: row[id],
                    podcastId: row[podcastId],
                    title: row[title],
                    description: row[description],
                    image30: row[image30],
                    image60: row[image60],
                    image100: row[image100],
                    image600: row[image600],
                    publishedAt: row[publishedAt],
                    shouldDownload: row[shouldDownload],
                    downloadUrl: row[downloadUrl],
                    duration: row[duration]
                )
        } catch {
            print("❌ Error fetching episodes for podcast: \(error)")
        }
        return nil
    }
}
