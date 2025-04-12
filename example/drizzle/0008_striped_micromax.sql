PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_podcasts` (
	`id` integer PRIMARY KEY NOT NULL,
	`apple_id` integer NOT NULL,
	`author` text,
	`description` text,
	`image` text,
	`title` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_podcasts`("id", "apple_id", "author", "description", "image", "title", "created_at", "updated_at") SELECT "id", "apple_id", "author", "description", "image", "title", "created_at", "updated_at" FROM `podcasts`;--> statement-breakpoint
DROP TABLE `podcasts`;--> statement-breakpoint
ALTER TABLE `__new_podcasts` RENAME TO `podcasts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `episodes` ADD `apple_id` text;