-- CreateTable
CREATE TABLE `users` (
    `id_user` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `profilePic` VARCHAR(191) NOT NULL,
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
    `owner_id` VARCHAR(191) NULL,
    `accountName` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `autoRelogin` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `steam_accounts_accountName_key`(`accountName`),
    INDEX `steam_accounts_owner_id_idx`(`owner_id`),
    PRIMARY KEY (`id_steamAccount`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plans` (
    `id_plan` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `name` ENUM('GUEST', 'SILVER', 'GOLD', 'DIAMOND') NOT NULL,
    `ownerId` VARCHAR(191) NULL,
    `type` ENUM('INFINITY', 'USAGE') NOT NULL DEFAULT 'USAGE',

    UNIQUE INDEX `plans_ownerId_key`(`ownerId`),
    PRIMARY KEY (`id_plan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `custom_plans` (
    `id_plan` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `name` ENUM('CUSTOM_USAGE_PLAN', 'CUSTOM_INFINITY_PLAN') NOT NULL,
    `ownerId` VARCHAR(191) NULL,
    `type` ENUM('INFINITY', 'USAGE') NOT NULL DEFAULT 'USAGE',
    `maxSteamAccounts` INTEGER NOT NULL,
    `maxGamesAllowed` INTEGER NOT NULL,
    `maxUsageTime` INTEGER NOT NULL,
    `priceInCents` INTEGER NOT NULL,
    `autoRelogin` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `custom_plans_ownerId_key`(`ownerId`),
    INDEX `custom_plans_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id_plan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `custom_plans_new` (
    `id_plan` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `originalPlanId` VARCHAR(191) NOT NULL,
    `maxSteamAccounts` INTEGER NOT NULL,
    `maxGamesAllowed` INTEGER NOT NULL,
    `maxUsageTime` INTEGER NOT NULL,
    `priceInCents` INTEGER NOT NULL,
    `autoRelogin` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `custom_plans_new_originalPlanId_key`(`originalPlanId`),
    INDEX `custom_plans_new_originalPlanId_idx`(`originalPlanId`),
    PRIMARY KEY (`id_plan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usages` (
    `id_usage` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `amountTime` INTEGER NOT NULL,
    `plan_id` VARCHAR(191) NULL,
    `custom_plan_id` VARCHAR(191) NULL,
    `user_id` VARCHAR(191) NOT NULL DEFAULT 'user_2Xk8sUsugFULRFTZoMjprlpeu0t',
    `accountName` VARCHAR(191) NOT NULL DEFAULT 'undefined',

    INDEX `usages_custom_plan_id_idx`(`custom_plan_id`),
    INDEX `usages_plan_id_idx`(`plan_id`),
    INDEX `usages_user_id_idx`(`user_id`),
    INDEX `usages_accountName_idx`(`accountName`),
    PRIMARY KEY (`id_usage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `purchases` (
    `id_Purchase` VARCHAR(191) NOT NULL,
    `owner_id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `purchases_owner_id_key`(`owner_id`),
    PRIMARY KEY (`id_Purchase`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
