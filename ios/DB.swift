import GRDB

func test() {
    do {
        // 1. Open a database connection
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let dbPath = documentsPath.appendingPathComponent("purecast_main.sqlite")
        let dbQueue = try DatabaseQueue(path: dbPath.path)

        // 2. Define the database schema
//        try dbQueue.write { db in
//            try db.create(table: "player") { t in
//                t.primaryKey("id", .text)
//                t.column("name", .text).notNull()
//                t.column("score", .integer).notNull()
//            }
//        }

        // 3. Define a record type
        struct Player: Codable, FetchableRecord, PersistableRecord {
            var id: String
            var name: String
            var score: Int
        }

        // 4. Write and read in the database
//        try dbQueue.write { db in
//            try Player(id: "1", name: "Arthur", score: 100).insert(db)
//            try Player(id: "2", name: "Barbara", score: 1000).insert(db)
//        }

        let players: [Player] = try dbQueue.read { db in
            try Player.fetchAll(db)
        }
        print(players.count)
    } catch {
        print("whoopsies")
        print("Error: \(error)")
    }
    
}
