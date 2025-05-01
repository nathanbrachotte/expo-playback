ALTER TABLE `episodes` RENAME COLUMN "image" TO "image_30";--> statement-breakpoint
ALTER TABLE `podcasts` RENAME COLUMN "image" TO "image_30";--> statement-breakpoint
ALTER TABLE `episodes` ADD `image_60` text;--> statement-breakpoint
ALTER TABLE `episodes` ADD `image_100` text;--> statement-breakpoint
ALTER TABLE `episodes` ADD `image_600` text;--> statement-breakpoint
ALTER TABLE `podcasts` ADD `image_60` text;--> statement-breakpoint
ALTER TABLE `podcasts` ADD `image_100` text;--> statement-breakpoint
ALTER TABLE `podcasts` ADD `image_600` text;