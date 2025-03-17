PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_episode_metadata` (
	`episode_id` integer PRIMARY KEY NOT NULL,
	`playback` integer DEFAULT 0,
	`is_finished` integer DEFAULT false,
	`download_progress` integer DEFAULT 0,
	`fileSize` integer,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_episode_metadata`("episode_id", "playback", "is_finished", "download_progress", "fileSize") SELECT "episode_id", "playback", "is_finished", "download_progress", "fileSize" FROM `episode_metadata`;--> statement-breakpoint
DROP TABLE `episode_metadata`;--> statement-breakpoint
ALTER TABLE `__new_episode_metadata` RENAME TO `episode_metadata`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_episodes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`podcast_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`image` text,
	`published_at` integer NOT NULL,
	`duration` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`podcast_id`) REFERENCES `podcasts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_episodes`("id", "podcast_id", "title", "description", "image", "published_at", "duration", "created_at", "updated_at") SELECT "id", "podcast_id", "title", "description", "image", "published_at", "duration", "created_at", "updated_at" FROM `episodes`;--> statement-breakpoint
DROP TABLE `episodes`;--> statement-breakpoint
ALTER TABLE `__new_episodes` RENAME TO `episodes`;