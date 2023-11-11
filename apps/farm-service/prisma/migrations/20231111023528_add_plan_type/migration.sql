-- DropForeignKey
ALTER TABLE `plans` DROP FOREIGN KEY `plans_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `purchases` DROP FOREIGN KEY `purchases_owner_id_fkey`;

-- DropForeignKey
ALTER TABLE `steam_accounts` DROP FOREIGN KEY `steam_accounts_owner_id_fkey`;

-- DropForeignKey
ALTER TABLE `steam_games` DROP FOREIGN KEY `steam_games_steamAccount_id_fkey`;

-- DropForeignKey
ALTER TABLE `usages` DROP FOREIGN KEY `usages_plan_id_fkey`;

-- AlterTable
ALTER TABLE `plans` ADD COLUMN `type` ENUM('INFINITY', 'USAGE') NOT NULL DEFAULT 'INFINITY';
