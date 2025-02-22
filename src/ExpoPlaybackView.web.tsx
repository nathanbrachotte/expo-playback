import * as React from 'react';

import { ExpoPlaybackViewProps } from './ExpoPlayback.types';

export default function ExpoPlaybackView(props: ExpoPlaybackViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
