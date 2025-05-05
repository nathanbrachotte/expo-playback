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

- [ ] Try: `npm run start` then `Shift + M`/Drizzle, then `run ios`
- [x] Fix navigation going Podcast > Episode > Podcast > Episode etc
- [x] Fix local episode query not working (always default to episode)
- [x] Finish player
- [x] Fix UI "jumping" when navigation (It's not the header)
- [ ] Change the mechanism to save the podcast locally, it should be taking all episodes from RSS feed and not itunes. Not doing rn since Erik is working on this file and he'll get mad at me if I do.
- [ ] Fix starting playing always tries to download
- [ ] Handle dates and durations
- [ ]
