/**
 * @import { MessageContextMenuCommandInteraction, MessageApplicationCommandData, If, CacheType } from "discord.js"
 *
 * @import { CommandExecuteFunction } from "../utils/types"
 */

const { ApplicationCommandType } = require("discord.js");

const BaseCommandExecutor = require("./BaseCommandExecutor");

/**
 * @template {MessageContextMenuCommandInteraction<CacheType>} [Interaction=MessageContextMenuCommandInteraction<CacheType>]
 * @augments BaseCommandExecutor
 */
module.exports = class MessageContextMenuCommand extends BaseCommandExecutor {
	/**
	 * @param {object} data Данные обработчика команды
	 * @param {Omit<MessageApplicationCommandData, "type">} data.discordData Данные команды
	 * @param {CommandExecuteFunction<Interaction>} [data.execute] Функция для вызова команды
	 */
	constructor(data) {
		super();
		this.discordData = data.discordData;
		this.discordData.type = ApplicationCommandType.Message;
		this.execute = data.execute;
	}
	/** @readonly */
	get name() {
		return this.discordData.name;
	}
};
