/**
 * @import { UserContextMenuCommandInteraction, UserApplicationCommandData, CacheType, If } from "discord.js"
 *
 * @import { CommandExecuteFunction } from "../utils/types"
 */

const { ApplicationCommandType } = require("discord.js");

const BaseCommandExecutor = require("./BaseCommandExecutor");

/**
 * @template {UserContextMenuCommandInteraction<CacheType>} [Interaction=UserContextMenuCommandInteraction<CacheType>]
 * @augments BaseCommandExecutor
 */
module.exports = class UserContextMenuCommand extends BaseCommandExecutor {
	/**
	 * @param {object} data Данные обработчика команды
	 * @param {Omit<UserApplicationCommandData, "type">} data.discordData Данные команды
	 * @param {CommandExecuteFunction<Interaction>} [data.execute] Функция для вызова команды
	 */
	constructor(data) {
		super();
		this.discordData = data.discordData;
		this.discordData.type = ApplicationCommandType.User;
		this.execute = data.execute;
	}
	/** @readonly */
	get name() {
		return this.discordData.name;
	}
};
