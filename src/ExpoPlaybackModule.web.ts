import { registerWebModule, NativeModule } from 'expo';

import { ExpoPlaybackModuleEvents } from './ExpoPlayback.types';

class ExpoPlaybackModule extends NativeModule<ExpoPlaybackModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoPlaybackModule);
