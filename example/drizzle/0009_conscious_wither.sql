PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_episodes` (
	`id` integer PRIMARY KEY NOT NULL,
	`podcast_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`image` text,
	`published_at` integer NOT NULL,
	`duration` integer NOT NULL,
	`should_download` integer DEFAULT false,
	`download_url` text NOT NULL,
	`apple_id` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`podcast_id`) REFERENCES `podcasts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_episodes`("id", "podcast_id", "title", "description", "image", "published_at", "duration", "should_download", "download_url", "apple_id", "created_at", "updated_at") SELECT "id", "podcast_id", "title", "description", "image", "published_at", "duration", "should_download", "download_url", "apple_id", "created_at", "updated_at" FROM `episodes`;--> statement-breakpoint
DROP TABLE `episodes`;--> statement-breakpoint
ALTER TABLE `__new_episodes` RENAME TO `episodes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;