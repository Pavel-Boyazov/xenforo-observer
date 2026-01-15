/**
 * @import { ChatInputApplicationCommandData, ChatInputCommandInteraction, AutocompleteInteraction, CacheType, If } from "discord.js"
 *
 * @import { CommandExecuteFunction } from "../utils/types"
 *
 * @import Autocomplete from "./Autocomplete"
 * @import Subcommand from "./Subcommand"
 * @import SubcommandGroup from "./SubcommandGroup"
 */

const fs = require("fs");
const path = require("path");

const { ApplicationCommandType } = require("discord.js");

const BaseCommandExecutor = require("./BaseCommandExecutor");

/**
 * @template {ChatInputCommandInteraction<CacheType>} [Interaction=ChatInputCommandInteraction<CacheType>]
 * @augments BaseCommandExecutor
 */
module.exports = class ChatInputCommand extends BaseCommandExecutor {
	/**
	 * @param {object} data Данные обработчика команды
	 * @param {Omit<ChatInputApplicationCommandData, "type">} data.discordData Данные команды
	 * @param {CommandExecuteFunction<Interaction>} [data.execute] Функция для вызова команды
	 */
	constructor(data) {
		super();
		this._discordData = data.discordData;
		/** @private */
		this._execute = data.execute;

		/**
		 * @private
		 * @type {Subcommand<this>[]}
		 */
		this._subcommands = [];
		/**
		 * @private
		 * @type {SubcommandGroup<this>[]}
		 */
		this._subcommandGroups = [];
		/**
		 * @private
		 * @type {Autocomplete[]}
		 */
		this._autocompletes = [];
	}
	/** @readonly */
	get name() {
		return this.discordData.name;
	}
	/**
	 * Регистрирует подклассы команды
	 * @param {string} commandFolderPath Путь к команде
	 */
	registerSubclasses(commandFolderPath) {
		const subcommandsFolderPath = path.join(commandFolderPath, "subcommands");
		const subcommandGroupsFolderPath = path.join(commandFolderPath, "subcommandGroups");
		const autocompletesFolderPath = path.join(commandFolderPath, "autocompletes");

		if (fs.existsSync(subcommandsFolderPath))
			this._subcommands = fs.readdirSync(subcommandsFolderPath, { withFileTypes: true }).map((dirent) => {
				const commandPath = path.join(subcommandsFolderPath, dirent.name);
				/** @type {Subcommand} */
				const command = require(commandPath);

				if (dirent.isDirectory()) command.registerSubclasses(commandPath);

				return command;
			});
		if (fs.existsSync(subcommandGroupsFolderPath))
			this._subcommandGroups = fs.readdirSync(subcommandGroupsFolderPath).map((fileName) => {
				const subcommandGroupPath = path.join(subcommandGroupsFolderPath, fileName);
				/** @type {SubcommandGroup} */
				const subcommandGroup = require(subcommandGroupPath);

				return subcommandGroup.registerSubclasses(subcommandGroupPath);
			});
		if (fs.existsSync(autocompletesFolderPath))
			this._autocompletes = fs
				.readdirSync(autocompletesFolderPath)
				.map((fileName) => require(path.join(autocompletesFolderPath, fileName)));

		return this;
	}
	/**
	 * Получить группу подкоманд команды
	 * @param {string} subcommandGroupName Название группы подкоманд
	 */
	getSubcommandGroup(subcommandGroupName) {
		if (!this._subcommandGroups.length) return null;

		return (
			this._subcommandGroups.find((subcommandGroup) => subcommandGroup.discordData.name === subcommandGroupName) ?? null
		);
	}
	/**
	 * Получить группу подкоманд команды
	 * @param {string} subcommandName Название подкоманды
	 * @param {string} [subcommandGroupName] Название группы подкоманд
	 */
	getSubcommand(subcommandName, subcommandGroupName) {
		if (!this._subcommands.length) return null;

		return subcommandGroupName
			? (this.getSubcommandGroup(subcommandGroupName)?.getSubcommand(subcommandName) ?? null)
			: (this._subcommands.find((subcommand) => subcommand._discordData.name === subcommandName) ?? null);
	}
	/**
	 * Получить авто-продолжение параметра
	 * @private
	 * @param {string} optionName Название группы подкоманд
	 * @param {string} [subcommandName] Название подкоманды
	 * @param {string} [subcommandGroupName] Название группы подкоманд
	 */
	_getAutocomplete(optionName, subcommandName, subcommandGroupName) {
		if (subcommandGroupName)
			return this.getSubcommand(subcommandName, subcommandGroupName)?._getAutocomplete(optionName) ?? null;
		else if (subcommandName) return this.getSubcommand(subcommandName)?._getAutocomplete(optionName) ?? null;
		return this._autocompletes.find((autocomplete) => autocomplete.optionName === optionName) ?? null;
	}
	/** @type {CommandExecuteFunction<Interaction>} */
	async execute(interaction, botInfo) {
		if (interaction.options.getSubcommandGroup())
			await this.getSubcommand(
				interaction.options.getSubcommand(true),
				interaction.options.getSubcommandGroup(),
			)._execute(interaction, botInfo);
		else if (interaction.options.getSubcommand(false))
			await this.getSubcommand(interaction.options.getSubcommand())._execute(interaction, botInfo);
		else await this._execute(interaction, botInfo);
	}
	/**
	 * Функция для вызова команды
	 * @param {AutocompleteInteraction} interaction Объект взаимодействия с командой
	 */
	async executeAutocomplete(interaction) {
		if (interaction.options.getSubcommandGroup())
			await this.getSubcommand(interaction.options.getSubcommand(true), interaction.options.getSubcommandGroup())
				._getAutocomplete(interaction.options.getFocused(true).name)
				.execute(interaction);
		else if (interaction.options.getSubcommand(false))
			await this.getSubcommand(interaction.options.getSubcommand())
				._getAutocomplete(interaction.options.getFocused(true).name)
				.execute(interaction);
		else await this._getAutocomplete(interaction.options.getFocused(true).name).execute(interaction);
	}
	/**
	 * Возвращает данные команды для сервера
	 * @returns {ChatInputApplicationCommandData?}
	 */
	get discordData() {
		const customCommandData = structuredClone(this._discordData);

		if (this._subcommands)
			customCommandData.options = (customCommandData.options ?? []).concat(
				this._subcommands.map((subcommand) => subcommand.discordData),
			);
		if (this._subcommandGroups)
			customCommandData.options = (customCommandData.options ?? []).concat(
				this._subcommandGroups.map((subcommandGroup) => subcommandGroup.discordData),
			);

		customCommandData.type = ApplicationCommandType.ChatInput;

		return customCommandData;
	}
};
