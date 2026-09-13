-- AlterTable
ALTER TABLE `user` ADD COLUMN `accountStatus` VARCHAR(20) NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX `User_accountStatus_idx` ON `User`(`accountStatus`);
