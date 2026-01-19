-- CreateTable
CREATE TABLE `access_overwrites` (
    `guild_id` VARCHAR(20) NOT NULL,
    `allowed_forums_ids` JSON NOT NULL,

    PRIMARY KEY (`guild_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
