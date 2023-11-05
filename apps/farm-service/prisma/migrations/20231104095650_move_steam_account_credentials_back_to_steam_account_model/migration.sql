/*
  Warnings:

  - You are about to drop the `steam_account_credentials` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[accountName]` on the table `steam_accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `accountName` to the `steam_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `steam_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `steam_account_credentials` DROP FOREIGN KEY `steam_account_credentials_steamAccount_id_fkey`;

-- AlterTable
ALTER TABLE `steam_accounts` ADD COLUMN `accountName` VARCHAR(191) NOT NULL,
    ADD COLUMN `password` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `steam_account_credentials`;

-- CreateIndex
CREATE UNIQUE INDEX `steam_accounts_accountName_key` ON `steam_accounts`(`accountName`);
