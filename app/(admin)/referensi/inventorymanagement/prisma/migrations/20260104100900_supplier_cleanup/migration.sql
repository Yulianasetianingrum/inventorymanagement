-- CreateTable
CREATE TABLE `user` (
    `id` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('OWNER', 'ADMIN', 'PURCHASING', 'WAREHOUSE_LEAD', 'WORKER') NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `pinHash` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authType` ENUM('PIN', 'PASSWORD') NOT NULL DEFAULT 'PASSWORD',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,

    UNIQUE INDEX `user_employeeId_key`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventoryitem` (
    `id` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `inventoryitem_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(160) NOT NULL,
    `brand` VARCHAR(120) NULL,
    `category` VARCHAR(120) NULL,
    `location` VARCHAR(160) NULL,
    `size` VARCHAR(80) NULL,
    `unit` VARCHAR(30) NOT NULL DEFAULT 'pcs',
    `stockNew` INTEGER NOT NULL DEFAULT 0,
    `stockUsed` INTEGER NOT NULL DEFAULT 0,
    `minStock` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `items_isActive_idx`(`isActive`),
    INDEX `items_updatedAt_idx`(`updatedAt`),
    UNIQUE INDEX `items_name_size_key`(`name`, `size`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stockledger` (
    `id` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `change` INTEGER NOT NULL,
    `reason` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NULL,
    `refId` VARCHAR(191) NULL,
    `refType` VARCHAR(191) NULL,
    `type` ENUM('IN', 'OUT', 'ADJ', 'RETURN') NOT NULL,

    INDEX `StockLedger_itemId_fkey`(`itemId`),
    INDEX `StockLedger_createdById_fkey`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `picklist` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `status` ENUM('READY', 'PICKING', 'PICKED', 'DELIVERED', 'CANCELED') NOT NULL,
    `priority` ENUM('NORMAL', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `assigneeId` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NULL,
    `neededAt` DATETIME(3) NULL,
    `notes` VARCHAR(191) NULL,
    `startedAt` DATETIME(3) NULL,
    `startedById` VARCHAR(191) NULL,
    `pickedAt` DATETIME(3) NULL,
    `deliveredAt` DATETIME(3) NULL,
    `canceledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `picklist_code_key`(`code`),
    INDEX `Picklist_assigneeId_fkey`(`assigneeId`),
    INDEX `Picklist_projectId_fkey`(`projectId`),
    INDEX `Picklist_createdById_fkey`(`createdById`),
    INDEX `Picklist_startedById_fkey`(`startedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `picklistline` (
    `id` VARCHAR(191) NOT NULL,
    `picklistId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `reqQty` INTEGER NOT NULL,
    `pickedQty` INTEGER NOT NULL DEFAULT 0,
    `uomSnapshot` VARCHAR(191) NOT NULL,
    `areaSnapshot` VARCHAR(191) NOT NULL,
    `shortageReason` VARCHAR(191) NULL,
    `condition` ENUM('OK', 'RUSAK') NULL,
    `notes` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `PicklistLine_itemId_fkey`(`itemId`),
    UNIQUE INDEX `picklistline_picklistId_itemId_key`(`picklistId`, `itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `picklistevent` (
    `id` VARCHAR(191) NOT NULL,
    `picklistId` VARCHAR(191) NOT NULL,
    `actorUserId` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `metaJson` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PicklistEvent_picklistId_idx`(`picklistId`),
    INDEX `PicklistEvent_createdAt_idx`(`createdAt`),
    INDEX `PicklistEvent_actorUserId_fkey`(`actorUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `handover` (
    `id` VARCHAR(191) NOT NULL,
    `picklistId` VARCHAR(191) NOT NULL,
    `receiverDept` ENUM('PRODUKSI', 'FINISHING', 'INSTALASI') NOT NULL,
    `receiverName` VARCHAR(191) NOT NULL,
    `confirmedByUserId` VARCHAR(191) NOT NULL,
    `confirmedAt` DATETIME(3) NOT NULL,
    `notes` VARCHAR(191) NULL,

    UNIQUE INDEX `handover_picklistId_key`(`picklistId`),
    INDEX `Handover_confirmedByUserId_fkey`(`confirmedByUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `return` (
    `id` VARCHAR(191) NOT NULL,
    `picklistId` VARCHAR(191) NOT NULL,
    `createdByUserId` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Return_picklistId_idx`(`picklistId`),
    INDEX `Return_createdAt_idx`(`createdAt`),
    INDEX `Return_createdByUserId_fkey`(`createdByUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `returnline` (
    `id` VARCHAR(191) NOT NULL,
    `returnId` VARCHAR(191) NOT NULL,
    `itemId` VARCHAR(191) NOT NULL,
    `qty` INTEGER NOT NULL,
    `condition` ENUM('OK', 'RUSAK') NOT NULL,
    `notes` VARCHAR(191) NULL,

    INDEX `ReturnLine_returnId_idx`(`returnId`),
    INDEX `ReturnLine_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `auditlog` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `detail` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `targetUserId` VARCHAR(191) NULL,
    `metaJson` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_userId_fkey`(`userId`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    INDEX `AuditLog_targetUserId_idx`(`targetUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_in_batches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `itemId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `qtyInBase` INTEGER NOT NULL,
    `unitCost` INTEGER NOT NULL,
    `qtyRemaining` INTEGER NOT NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `stock_in_batches_itemId_idx`(`itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `letak` VARCHAR(191) NOT NULL,
    `itemsCsv` VARCHAR(1000) NULL,
    `notes` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `project` (
    `id` VARCHAR(191) NOT NULL,
    `namaProjek` VARCHAR(191) NOT NULL,
    `namaKlien` VARCHAR(191) NOT NULL,
    `noHpWa` VARCHAR(191) NOT NULL,
    `keperluan` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `namaToko` VARCHAR(191) NOT NULL,
    `keperluanItems` JSON NOT NULL,
    `alamat` TEXT NOT NULL,
    `mapsUrl` TEXT NULL,
    `noTelp` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `stockledger` ADD CONSTRAINT `stockledger_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventoryitem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stockledger` ADD CONSTRAINT `stockledger_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `picklist` ADD CONSTRAINT `picklist_assigneeId_fkey` FOREIGN KEY (`assigneeId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `picklist` ADD CONSTRAINT `picklist_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `picklist` ADD CONSTRAINT `picklist_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `project`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `picklist` ADD CONSTRAINT `picklist_startedById_fkey` FOREIGN KEY (`startedById`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `picklistline` ADD CONSTRAINT `picklistline_picklistId_fkey` FOREIGN KEY (`picklistId`) REFERENCES `picklist`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `picklistline` ADD CONSTRAINT `picklistline_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventoryitem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `picklistevent` ADD CONSTRAINT `picklistevent_picklistId_fkey` FOREIGN KEY (`picklistId`) REFERENCES `picklist`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `picklistevent` ADD CONSTRAINT `picklistevent_actorUserId_fkey` FOREIGN KEY (`actorUserId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `handover` ADD CONSTRAINT `handover_picklistId_fkey` FOREIGN KEY (`picklistId`) REFERENCES `picklist`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `handover` ADD CONSTRAINT `handover_confirmedByUserId_fkey` FOREIGN KEY (`confirmedByUserId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `return` ADD CONSTRAINT `return_picklistId_fkey` FOREIGN KEY (`picklistId`) REFERENCES `picklist`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `return` ADD CONSTRAINT `return_createdByUserId_fkey` FOREIGN KEY (`createdByUserId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `returnline` ADD CONSTRAINT `returnline_returnId_fkey` FOREIGN KEY (`returnId`) REFERENCES `return`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `returnline` ADD CONSTRAINT `returnline_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `inventoryitem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditlog` ADD CONSTRAINT `auditlog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `auditlog` ADD CONSTRAINT `auditlog_targetUserId_fkey` FOREIGN KEY (`targetUserId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_in_batches` ADD CONSTRAINT `stock_in_batches_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
