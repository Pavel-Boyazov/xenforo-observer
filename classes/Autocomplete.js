/**
 * @import { AutocompleteInteraction, ApplicationCommandOptionChoiceData } from "discord.js"
 */

/**
 * Функция для получения параметров авто-продолжения
 * @callback GetRespondFunction
 * @param {AutocompleteInteraction} interaction Взаимодействие со слеш-командой
 * @returns {ApplicationCommandOptionChoiceData<string | number>[] | Promise<ApplicationCommandOptionChoiceData<string | number>[]}
 */

module.exports = class Autocomplete {
	/**
	 * @param {object} data Данные авто-продолжения
	 * @param {string} data.optionName Название параметра которой принадлежит авто-продолжение
	 * @param {GetRespondFunction} data.getRespond Функция для получения параметров авто-продолжения
	 */
	constructor(data) {
		this.optionName = data.optionName;
		/** @private */
		this._getRespond = data.getRespond;
	}
	/** @private */
	_isAnswered = false;
	/**
	 * Функция для вызова команды
	 * @param {AutocompleteInteraction} interaction Объект взаимодействия с командой
	 * @returns {Promise<void>} Ответ на авто-продолжение
	 */
	async execute(interaction) {
		if (this._isAnswered) this._isAnswered = false;
		/** @type {ApplicationCommandOptionChoiceData<string | number>[] | void} */
		let options;

		try {
			options = await this._getRespond(interaction);
		} catch (err) {
			return console.error(err);
		}

		if (!options || this._isAnswered) return;
		this._isAnswered = true;

		return interaction.respond(options);
	}
};
