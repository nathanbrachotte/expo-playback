import SQLite
typealias Expression = SQLite.Expression

func test() {
    do {
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let dbPath = documentsPath.appendingPathComponent("purecast_main_db.sqlite")
        let db = try Connection(dbPath.absoluteString)
        

        let users = Table("users")
        let id = Expression<Int64>("id")
        let name = Expression<String>("name")
        // 1. Open a database connection
        for user in try db.prepare(users) {
                print("📱 ~ Native User ~ id: \(user[id]), name: \(user[name])")
                // id: 1, name: Optional("Alice"), email: alice@mac.com
            }
    } catch {
        print("whoopsies")
        print("Error: \(error)")
    }
    
}
