//
//  ExpoPlayback.swift
//  expoplaybackexample
//
//  Created by Erik Waterloo on 30.04.25.
//

import Foundation
import ExpoPlayback

@objc public class ExpoPlaybackWrapper: NSObject {
  @objc public static let shared = ExpoPlaybackWrapper()
  
  @objc public func setup() {
    //EpisodeDownloader.shared.setupBackgroundTask()
  }
}
