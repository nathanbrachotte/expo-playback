CREATE TABLE `episode_metadata` (
	`episode_id` integer PRIMARY KEY NOT NULL,
	`playback` integer NOT NULL,
	`is_finished` integer DEFAULT false NOT NULL,
	`download_progress` integer,
	`fileSize` integer,
	FOREIGN KEY (`episode_id`) REFERENCES `episodes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `episodes` (
	`id` integer PRIMARY KEY NOT NULL,
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
CREATE TABLE `podcasts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`image` text,
	`download_url` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
