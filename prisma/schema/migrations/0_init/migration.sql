-- CreateTable
CREATE TABLE `action_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `guildId` VARCHAR(20) NOT NULL,
    `executorId` VARCHAR(20) NOT NULL,
    `type` ENUM('CREATE', 'DELETE') NOT NULL,
    `subscriptionId` INTEGER NULL,
    `link_type` ENUM('THREAD', 'FORUM') NULL,
    `link_id` INTEGER NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `id_data` (
    `id` INTEGER NOT NULL DEFAULT 0,
    `last_thread_id` INTEGER NOT NULL DEFAULT 0,
    `last_post_id` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `observed_links` (
    `type` ENUM('THREAD', 'FORUM') NOT NULL,
    `id` INTEGER NOT NULL,
    `last_page` INTEGER NULL,

    PRIMARY KEY (`type`, `id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscriptions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `target_id` VARCHAR(20) NOT NULL,
    `link_type` ENUM('THREAD', 'FORUM') NOT NULL,
    `link_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `guild_id` VARCHAR(20) NULL,
    `filter_prefixes_ids` JSON NULL,
    `filter_post_id` INTEGER NULL,
    `moderator_roles_ids` JSON NULL,
    `default_text` VARCHAR(191) NULL,
    `default_prefixes_ids` JSON NULL,
    `default_actions` JSON NULL,

    UNIQUE INDEX `subscriptions_target_id_link_type_link_id_key`(`target_id`, `link_type`, `link_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `action_logs` ADD CONSTRAINT `action_logs_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `action_logs` ADD CONSTRAINT `action_logs_link_type_link_id_fkey` FOREIGN KEY (`link_type`, `link_id`) REFERENCES `observed_links`(`type`, `id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_link_type_link_id_fkey` FOREIGN KEY (`link_type`, `link_id`) REFERENCES `observed_links`(`type`, `id`) ON DELETE CASCADE ON UPDATE CASCADE;
