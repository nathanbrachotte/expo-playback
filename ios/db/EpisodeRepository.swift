import SQLite

struct Episode {
    let id: Int64
    let podcastId: Int64
    let title: String
    let description: String
    let image: String?
    let publishedAt: Int64
    let downloadUrl: String
    let duration: Int64
}

class EpisodeRepository {
    private let db = SQLiteManager.shared.getDB()

    private let episodes = Table("episodes")
    private let id = Expression<Int64>("id")
    private let podcastId = Expression<Int64>("podcast_id")
    private let title = Expression<String>("title")
    private let description = Expression<String>("description")
    private let image = Expression<String?>("image")
    private let publishedAt = Expression<Int64>("published_at")
    private let downloadUrl = Expression<String>("download_url")
    private let duration = Expression<Int64>("duration")

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
                    image: row[image],
                    publishedAt: row[publishedAt],
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
                    image: row[image],
                    publishedAt: row[publishedAt],
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
}
