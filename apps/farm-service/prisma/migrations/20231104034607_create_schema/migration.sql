-- CreateTable
CREATE TABLE `users` (
    `id_user` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `profilePic` VARCHAR(191) NOT NULL,
    `plan` ENUM('GUEST', 'SILVER', 'GOLD', 'DIAMOND') NOT NULL,
    `role` ENUM('ADMIN', 'USER') NOT NULL,
    `status` ENUM('ACTIVE', 'BANNED') NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id_user`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `steam_accounts` (
    `id_steamAccount` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `owner_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_steamAccount`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `steam_games` (
    `id_steamGame` VARCHAR(191) NOT NULL,
    `steamAccount_id` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `steam_games_gameId_key`(`gameId`),
    UNIQUE INDEX `steam_games_steamAccount_id_gameId_key`(`steamAccount_id`, `gameId`),
    PRIMARY KEY (`id_steamGame`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `steam_account_credentials` (
    `id_steamAccountCredentials` VARCHAR(191) NOT NULL,
    `steamAccount_id` VARCHAR(191) NOT NULL,
    `accountName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `steam_account_credentials_steamAccount_id_key`(`steamAccount_id`),
    UNIQUE INDEX `steam_account_credentials_accountName_key`(`accountName`),
    PRIMARY KEY (`id_steamAccountCredentials`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchases` (
    `id_Purchase` VARCHAR(191) NOT NULL,
    `owner_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `purchases_owner_id_key`(`owner_id`),
    PRIMARY KEY (`id_Purchase`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `steam_accounts` ADD CONSTRAINT `steam_accounts_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `steam_games` ADD CONSTRAINT `steam_games_steamAccount_id_fkey` FOREIGN KEY (`steamAccount_id`) REFERENCES `steam_accounts`(`id_steamAccount`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `steam_account_credentials` ADD CONSTRAINT `steam_account_credentials_steamAccount_id_fkey` FOREIGN KEY (`steamAccount_id`) REFERENCES `steam_accounts`(`id_steamAccount`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `purchases` ADD CONSTRAINT `purchases_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;
