import SQLite

struct Podcast {
    let id: Int64
    let title: String
    let description: String?
    let image30: String?
    let image60: String?
    let image100: String?
    let image600: String?
    let createdAt: Int64?
    let updatedAt: Int64?
}

class PodcastRepository {
    private let db = SQLiteManager.shared.getDB()
    
    private let podcasts = Table("podcasts")
    private let id = Expression<Int64>("id")
    private let title = Expression<String>("title")
    private let description = Expression<String?>("description")
    private let image30 = Expression<String?>("image_30")
    private let image60 = Expression<String?>("image_60")
    private let image100 = Expression<String?>("image_100")
    private let image600 = Expression<String?>("image_600")
    private let createdAt = Expression<Int64?>("created_at")
    private let updatedAt = Expression<Int64?>("updated_at")

    func getAllPodcasts() -> [Podcast] {
        var result: [Podcast] = []
        guard let db = db else { return result }

        do {
            for row in try db.prepare(podcasts) {
                result.append(rowToPodcast(row: row))
            }
        } catch {
            print("❌ Error fetching podcasts: \(error)")
        }
        
        return result
    }
    
    func getPodcastById(podcastId: Int64) -> Podcast? {
        guard let db = db else { return nil }
        do {
            let query = podcasts.filter(id == podcastId)
            guard let row = try db.prepare(query).makeIterator().next() else {return nil}
            return rowToPodcast(row: row)
        } catch {
            print("❌ Error fetching episodes for podcast: \(error)")
        }
        return nil
    }
    
    func rowToPodcast(row: Row) -> Podcast {
        return Podcast(
            id: row[id],
            title: row[title],
            description: row[description],
            image30: row[image30],
            image60: row[image60],
            image100: row[image100],
            image600: row[image600],
            createdAt: row[createdAt],
            updatedAt: row[updatedAt]
        )
    }
}
