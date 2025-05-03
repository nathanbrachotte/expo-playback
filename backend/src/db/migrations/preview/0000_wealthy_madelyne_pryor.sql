CREATE TABLE `episodes` (
	`id` integer PRIMARY KEY NOT NULL,
	`podcast_id` integer NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`image_30` text,
	`image_60` text,
	`image_100` text,
	`image_600` text,
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
CREATE TABLE `podcasts` (
	`id` integer PRIMARY KEY NOT NULL,
	`apple_id` integer NOT NULL,
	`author` text,
	`description` text,
	`image_30` text,
	`image_60` text,
	`image_100` text,
	`image_600` text,
	`title` text NOT NULL,
	`rss_feed_url` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
