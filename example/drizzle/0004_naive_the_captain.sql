ALTER TABLE `episode_metadata` RENAME COLUMN "fileSize" TO "file_size";--> statement-breakpoint
ALTER TABLE `episode_metadata` ADD `file_path` text;--> statement-breakpoint
ALTER TABLE `episodes` ADD `download_url` text NOT NULL;--> statement-breakpoint
ALTER TABLE `podcasts` DROP COLUMN `download_url`;