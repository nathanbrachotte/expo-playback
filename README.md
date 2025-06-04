# expo-playback

Expo Module to handle audio playback from native

## Commands

```shell
npx expo install <lib>
npm run ios
npm db:generate
cd ios && pod install && cd .. # install pods
```

## TODO

- [x] Try: `npm run start` then `Shift + M`/Drizzle, then `s` to switch to build mode and `i`
  - `npm run start`
  - `Shift + M`
  - `s` to switch to build mode
  - `i` to start iOS
- [x] Fix navigation going Podcast > Episode > Podcast > Episode etc
- [x] Fix local episode query not working (always default to episode)
- [x] Finish player
- [x] Fix UI "jumping" when navigation (It's not the header)
- [x] Change the mechanism to save the podcast locally, it should be taking all episodes from RSS feed and not itunes. Not doing rn since Erik is working on this file and he'll get mad at me if I do.
- [x] Add way to copy episodeId easily
- [x] Add "..." ios action sheet
  - [ ] Add it everwhere
- [ ] Performances in search
- [ ] Don't render HTML in Cards
- [x] Player
- [ ] Fix starting playing always tries to download
- [x] Handle dates and durations
- [ ] Hook the "mark as played" / "unplay" button
- [ ] Hook the Download button
- [x] Player empty state
- [ ] Update weird transparent gradient
- [ ] Make "play" button also show "pause" if actively playing

## SQLite

```ts
// Log sql from queries
.toSQL()
```
