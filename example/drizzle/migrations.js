// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import m0000 from "./0000_strange_winter_soldier.sql"
import m0001 from "./0001_even_newton_destine.sql"
import m0002 from "./0002_low_emma_frost.sql"
import m0003 from "./0003_round_red_skull.sql"
import m0004 from "./0004_naive_the_captain.sql"
import journal from "./meta/_journal.json"

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004,
  },
}
