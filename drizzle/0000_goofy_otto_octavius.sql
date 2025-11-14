CREATE TABLE `business_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`searchId` integer NOT NULL,
	`businessName` text(255) NOT NULL,
	`website` text(500),
	`email` text(320) NOT NULL,
	`phone` text(20),
	`address` text,
	`city` text(100),
	`postalCode` text(10),
	`emailSource` text(500),
	`createdAt` integer NOT NULL,
	FOREIGN KEY (`searchId`) REFERENCES `scraping_searches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `scraping_searches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`department` text(100) NOT NULL,
	`sector` text(255) NOT NULL,
	`totalResults` integer DEFAULT 0,
	`status` text DEFAULT 'pending',
	`errorMessage` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text(64) NOT NULL,
	`name` text,
	`email` text(320),
	`loginMethod` text(64),
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);