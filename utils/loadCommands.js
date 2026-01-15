/**
 * @import { Client } from "discord.js"
 *
 * @import { BotInfo } from "../../utils/types"
 */

/**
 * Формирует и загружает команды на сервера
 * @param {Client} client discord.js Client
 * @param {BotInfo} botInfo Данные бота
 * @returns {Promise<*[]>}
 */
module.exports = function loadCommands(client, botInfo) {
	return client.application.commands
		.set(
			[...botInfo.chatInputCommands, ...botInfo.userContextMenuCommands, ...botInfo.messageContextMenuCommands].map(
				({ discordData }) => discordData,
			),
		)
		.then(() => console.log("Список глобальных команд был обновлён"))
		.catch((err) => {
			console.error(err);
			console.log("Список глобальных команд не был обновлён из-за ошибки");
		});
};
