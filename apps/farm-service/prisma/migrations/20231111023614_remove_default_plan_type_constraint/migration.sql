-- DropIndex
DROP INDEX `steam_accounts_owner_id_fkey` ON `steam_accounts`;

-- DropIndex
DROP INDEX `usages_plan_id_fkey` ON `usages`;

-- AlterTable
ALTER TABLE `plans` ALTER COLUMN `type` DROP DEFAULT;
