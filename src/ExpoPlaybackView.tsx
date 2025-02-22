import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoPlaybackViewProps } from './ExpoPlayback.types';

const NativeView: React.ComponentType<ExpoPlaybackViewProps> =
  requireNativeView('ExpoPlayback');

export default function ExpoPlaybackView(props: ExpoPlaybackViewProps) {
  return <NativeView {...props} />;
}
