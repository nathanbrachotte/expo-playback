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

### N8

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
  - [x] Add it everwhere
- [x] Performances in search
- [x] Don't render HTML in Cards
- [x] Player
- [x] When removing podcast, must remove episode and episodeMetadata too
- [x] Finish Downloaded / InProgress screens
- [x] Make scrollbar light

  - [x] Abstract EpisodeCard better so it's easily reusable around the app

- [x] Update episode id to be podcastId-creationDate so we can always have the same ids for episodes used in backend
- [ ] Fix starting playing always tries to download
- [x] Fix padding of EpisodeScreen's description scrollview
- [x] Handle dates and durations
- [x] Hook the "mark as played" / "unplay" button
- [x] Hook the Download button
- [x] Player empty state
- [x] Update weird transparent gradient
- [x] Make "play" button also show "pause" if actively playing
  - [x] Update pause button UI
- [ ] Add logic to refetch latest episodes of each podcast on app mount
  - [x] Pull to refresh on LatestEpisodeScreen
    - [ ] Investigate some duplicated episodes
- [ ] Live updates (when something updates on native side, reflect it on RN)
- [x] Action sheet on Episode Screen
- [ ] Build / Send to AppStore
- [ ] Have a download and a play button even if the episode is not downloaded
- [ ] Why are search not case insensitive?
- [ ] Use Flashlist for long lists of episodes
- [ ]
- [ ]
- [ ]

#### Future N8

- [ ] "To listen later" playlist
- [ ] Build "segemented progress" component

### Erik

- [ ] Auto-play next episode in background
- [x] Fix scenario where download is stopped
- [x] Remove download feature
- [ ] Use duration from metadata once file is downloaded
- [x] Harden the download process
- [x] Player integration with the native side
- [x] Previous / Next 15 seconds
- [x] Seeking
- [x] Recover from download interruption
- [ ] Auto-download last 3 episodes of each podcast?
- [ ] Instantly play episode even when not downloaded
- [ ] Remove all downloads when podcast is removed from library

#### Future Erik

- [ ] Android
- [ ]

## Resources

### SponsorBlock

- https://sb.ltn.fi/video/aEsNRUMySIg/
- https://sponsor.ajay.app/donate/
-

## SQLite

```ts
// Log sql from queries
.toSQL()
```
