ALTER TABLE `episodes` ADD `episode_rss_id` text;--> statement-breakpoint
CREATE UNIQUE INDEX `episodes_episode_rss_id_unique` ON `episodes` (`episode_rss_id`);