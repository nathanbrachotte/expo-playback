PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_episode_metadata` (
	`episode_id` integer PRIMARY KEY NOT NULL,
	`playback` integer DEFAULT 0,
	`is_finished` integer DEFAULT false,
	`download_progress` integer DEFAULT 0,
	`file_size` integer DEFAULT 0,
	`relative_file_path` text,
	`duration` integer DEFAULT 0,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_episode_metadata`("episode_id", "playback", "is_finished", "download_progress", "file_size", "relative_file_path", "duration") SELECT "episode_id", "playback", "is_finished", "download_progress", "file_size", "relative_file_path", "duration" FROM `episode_metadata`;--> statement-breakpoint
DROP TABLE `episode_metadata`;--> statement-breakpoint
ALTER TABLE `__new_episode_metadata` RENAME TO `episode_metadata`;--> statement-breakpoint
PRAGMA foreign_keys=ON;