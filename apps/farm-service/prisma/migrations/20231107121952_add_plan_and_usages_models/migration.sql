/*
  Warnings:

  - You are about to drop the column `plan` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `users` DROP COLUMN `plan`;

-- CreateTable
CREATE TABLE `plans` (
    `id_plan` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `name` ENUM('GUEST', 'SILVER', 'GOLD', 'DIAMOND') NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `plans_ownerId_key`(`ownerId`),
    PRIMARY KEY (`id_plan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usages` (
    `id_usage` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `amountTime` INTEGER NOT NULL,
    `plan_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_usage`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `plans` ADD CONSTRAINT `plans_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id_user`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usages` ADD CONSTRAINT `usages_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id_plan`) ON DELETE CASCADE ON UPDATE CASCADE;
