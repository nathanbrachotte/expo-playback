import SQLite
typealias Expression = SQLite.Expression

class SQLiteManager {
    static let shared = SQLiteManager()
    private var db: Connection?

    private init() {
        do {
            let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            let dbPath = documentsPath.appendingPathComponent("purecast_main_db.sqlite")
            db = try Connection(dbPath.absoluteString)
        } catch {
            print("❌ Database connection failed: \(error)")
        }
    }

    func getDB() -> Connection? {
        return db
    }
}
