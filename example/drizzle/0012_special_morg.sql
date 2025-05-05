ALTER TABLE `episodes` ADD `rss_id` text;--> statement-breakpoint
ALTER TABLE `episodes` DROP COLUMN `apple_id`;--> statement-breakpoint
ALTER TABLE `podcasts` ADD `is_followed` integer DEFAULT false;