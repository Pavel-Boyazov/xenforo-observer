/**
 * @import { ApplicationCommandSubCommandData, ChatInputCommandInteraction } from "discord.js"
 *
 * @import { CommandExecuteFunction } from "../utils/types"
 *
 * @import Autocomplete from "./Autocomplete"
 * @import ChatInputCommand from "./ChatInputCommand"
 */

const fs = require("fs");
const path = require("path");

const { ApplicationCommandOptionType } = require("discord.js");

/**
 * Функция для получения данных команды для дискорда
 * @callback ConfigureFunction
 * @param {ApplicationCommandSubCommandData} customCommandData Копия данных команды
 * @returns {ApplicationCommandSubCommandData?}
 */

/**
 * @template {ChatInputCommand | undefined} [Command=undefined]
 */
module.exports = class Subcommand {
	/**
	 * @template {ChatInputCommand | undefined} [Command=undefined]
	 * @typedef {Command extends ChatInputCommand<infer Interaction> ? Interaction : ChatInputCommandInteraction<"cached">} Interaction
	 */
	/**
	 * @param {object} data Данные подкоманды
	 * @param {Omit<ApplicationCommandSubCommandData, "type">} data.discordData Данные команды для дискорда
	 * @param {CommandExecuteFunction<Interaction<Command>>} data.execute Функция для вызова команды
	 */
	constructor(data) {
		/** @private */
		this._discordData = data.discordData;
		/** @private */
		this._execute = data.execute;

		/**
		 * @private
		 * @type {Autocomplete[]}
		 */
		this._autocompletes = [];
	}
	get discordData() {
		const customSubCommandData = structuredClone(this._discordData);
		customSubCommandData.type = ApplicationCommandOptionType.Subcommand;
		return customSubCommandData;
	}
	/**
	 * Регистрирует подклассы подкоманды
	 * @param {string} subcommandFolderPath Путь к подкоманде
	 * @returns {this}
	 */
	registerSubclasses(subcommandFolderPath) {
		const autocompletesFolderPath = path.join(subcommandFolderPath, "autocompletes");

		if (fs.existsSync(autocompletesFolderPath))
			this._autocompletes = fs
				.readdirSync(autocompletesFolderPath)
				.map((fileName) => require(path.join(autocompletesFolderPath, fileName)));

		return this;
	}
	/**
	 * Получить авто-продолжение параметра
	 * @param {string} optionName Название группы подкоманд
	 * @returns {Autocomplete?}
	 */
	_getAutocomplete(optionName) {
		if (!this._autocompletes.length) return null;
		return this._autocompletes.find((autocomplete) => autocomplete.optionName === optionName) ?? null;
	}
};
