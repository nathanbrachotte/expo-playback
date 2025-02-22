// Reexport the native module. On web, it will be resolved to ExpoPlaybackModule.web.ts
// and on native platforms to ExpoPlaybackModule.ts
export { default } from './ExpoPlaybackModule';
export { default as ExpoPlaybackView } from './ExpoPlaybackView';
export * from  './ExpoPlayback.types';
