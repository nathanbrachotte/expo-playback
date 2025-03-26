import SQLite

struct Podcast {
    let id: Int64
    let title: String
    let description: String?
    let image: String?
    let createdAt: Int64
    let updatedAt: Int64
}

class PodcastRepository {
    private let db = SQLiteManager.shared.getDB()
    
    private let podcasts = Table("podcasts")
    private let id = Expression<Int64>("id")
    private let title = Expression<String>("title")
    private let description = Expression<String?>("description")
    private let image = Expression<String?>("image")
    private let createdAt = Expression<Int64>("created_at")
    private let updatedAt = Expression<Int64>("updated_at")

    func getAllPodcasts() -> [Podcast] {
        var result: [Podcast] = []
        guard let db = db else { return result }

        do {
            for row in try db.prepare(podcasts) {
                let podcast = Podcast(
                    id: row[id],
                    title: row[title],
                    description: row[description],
                    image: row[image],
                    createdAt: row[createdAt],
                    updatedAt: row[updatedAt]
                )
                result.append(podcast)
            }
        } catch {
            print("❌ Error fetching podcasts: \(error)")
        }
        
        return result
    }
}
