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
- [x] Fix starting playing always tries to download
- [x] Fix padding of EpisodeScreen's description scrollview
- [x] Handle dates and durations
- [x] Hook the "mark as played" / "unplay" button
- [x] Hook the Download button
- [x] Player empty state
- [x] Update weird transparent gradient
- [x] Make "play" button also show "pause" if actively playing
  - [x] Update pause button UI
- [x] Add logic to refetch latest episodes of each podcast on app mount
  - [x] Pull to refresh on LatestEpisodeScreen
    - [x] Investigate some duplicated episodes
- [x] Live updates (when something updates on native side, reflect it on RN)
- [x] Action sheet on Episode Screen
- [x] Have a download and a play button even if the episode is not downloaded
- [x] Why are search not case insensitive?
- [x] Use Flashlist for long lists of episodes
- [ ] Search & Add Podcasts issues
  - [x] „Fest &“ also can’t find it maybe search issues with special chars
  - [x] KFC Radio breaks
  - [ ] EKN Radio Network breaks
  - [ ] Vastuullisuuden
- [ ] Progress bar should show at least a little
  - [x] Use a progress bar that doesn't animate at all time
- [ ] Players icons should be same width
- [x] Search not showing adding podcasts - Plus
- [ ] Splash screen
- [ ] Make sure localization is only asked at search and explain why

#### Release strategy

- [ ] Buy a bunch of reddit accounts
- [ ] Figure out app store keywords
- [ ] Build / Send to AppStore

#### Future N8

- [ ] Language support
- [ ] "To listen later" playlist
- [ ] Build "segemented progress" component

### Erik

- [x] Auto-play next episode in background
- [x] Fix scenario where download is stopped
- [x] Remove download feature
- [x] Use duration from metadata once file is downloaded
- [x] Harden the download process
- [x] Player integration with the native side
- [x] Previous / Next 15 seconds
- [x] Seeking
- [x] Recover from download interruption
- [ ] Auto-download last 3 episodes of each podcast?
- [x] Instantly play episode even when not downloaded (changed to start downloading and then playing with one button press)
- [x] Remove all downloads when podcast is removed from library
- [x] Pick up last progress when a episode is played
- [x] Sync progress in list with current progress
- [x] Mark as finished button
- [ ] Live updates on delete episode
- [ ] Live updates on first playing an episode after download in list
- [ ] Live updates on progress for time left on list

#### Future Erik

- [ ] Android
- [ ]

## Known issues

- [ ] KFC Radio podcast # of episode goes from 934 episodes on itunes to 909 once downloaded form RSS feed. Itunes might be wrong, or something goes wrong for these episodes.
- [ ] When saving a podcast and its episodes and an episode contains bad data, the podcast is still saved although we're in a transaction.
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
