-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_guild_id_fkey` FOREIGN KEY (`guild_id`) REFERENCES `access_overwrites`(`guild_id`) ON DELETE CASCADE ON UPDATE CASCADE;
