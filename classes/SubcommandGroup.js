/**
 * @import { ApplicationCommandSubCommandData } from "discord.js"
 *
 * @import ChatInputCommand from "./ChatInputCommand"
 * @import Subcommand from "./Subcommand"
 */

const fs = require("fs");
const path = require("path");

const { ApplicationCommandOptionType } = require("discord.js");

/**
 * @template {ChatInputCommand | undefined} [Command=undefined]
 */
module.exports = class SubcommandGroup {
	/**
	 * @param {object} data Данные группы подкоманд
	 * @param {Omit<ApplicationCommandSubCommandData, "type">} data.discordData Данные команды для дискорда
	 */
	constructor(data) {
		/** @private */
		this._discordData = data.discordData;

		/**
		 * @private
		 * @type {Subcommand<Command>[]}
		 */
		this._subcommands = [];
	}
	/**
	 * Регистрирует подклассы группы подкоманд
	 * @param {string} subcommandGroupFolderPath Путь к группе подкоманд
	 * @returns {this}
	 */
	registerSubclasses(subcommandGroupFolderPath) {
		const subcommandsFolderPath = path.join(subcommandGroupFolderPath, "subcommands");

		if (fs.existsSync(subcommandsFolderPath))
			this._subcommands = fs.readdirSync(subcommandsFolderPath, { withFileTypes: true }).map((dirent) => {
				const commandPath = path.join(subcommandsFolderPath, dirent.name);
				/** @type {Subcommand} */
				const command = require(commandPath);

				if (dirent.isDirectory()) command.registerSubclasses(commandPath);

				return command;
			});

		return this;
	}
	get discordData() {
		const subcommandGroupData = structuredClone(this._discordData);

		if (this._subcommands)
			subcommandGroupData.options = (subcommandGroupData.options ?? []).concat(
				this._subcommands.map((subcommand) => subcommand.discordData),
			);

		subcommandGroupData.type = ApplicationCommandOptionType.SubcommandGroup;

		return subcommandGroupData;
	}
	/**
	 * Получить группу подкоманд команды
	 * @param {string} subcommandName Название подкоманды
	 */
	getSubcommand(subcommandName) {
		if (!this._subcommands.length) return null;

		return this._subcommands.find((subcommand) => subcommand.discordData.name === subcommandName) ?? null;
	}
};
