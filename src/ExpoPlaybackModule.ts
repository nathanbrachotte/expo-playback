import { NativeModule, requireNativeModule } from 'expo';

import { ExpoPlaybackModuleEvents } from './ExpoPlayback.types';

declare class ExpoPlaybackModule extends NativeModule<ExpoPlaybackModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoPlaybackModule>('ExpoPlayback');
