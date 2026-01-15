/**
 * @import { BaseInteraction, MessageComponentInteraction, ModalSubmitInteraction } from "discord.js"
 *
 * @import { CustomIdPayload, BotInfo } from "../utils/types"
 */

/**
 * @template {BaseInteraction} [Interaction=BaseInteraction]
 * @template {{ [name: string]: "string" | "number" | "boolean" }} CustomIdPayloadTypes
 * Функция для вызова команды
 * @callback ExecuteFunction
 * @param {Interaction} interaction Взаимодействие
 * @param {CustomIdPayload<CustomIdPayloadTypes>} payload Полезная нагрузка из customId
 * @param {BotInfo} botInfo Информация об обработчиках бота
 * @returns {*}
 */

/**
 * Вычисляет полезную нагрузку из customId
 * @template {{ [name: string]: "string" | "number" | "boolean" }} CustomIdPayloadTypes
 * @param {string} customId Custom ID компонента
 * @param {CustomIdPayloadTypes} componentPayload Полезная нагрузка принимаемая компонентом
 * @returns {CustomIdPayload<CustomIdPayloadTypes>}
 */
function calculatePayload(customId, componentPayload) {
	/** @type {CustomIdPayload<CustomIdPayloadTypes>} */
	let payload = {};
	const payloadKeys = Object.keys(componentPayload);

	if (payloadKeys.length > 0) {
		const customIdParams = customId.split(":").slice(1);

		if (customIdParams.length > payloadKeys.length) {
			const lastParamIndex = payloadKeys.length - 1;
			customIdParams.splice(
				lastParamIndex,
				customIdParams.length - lastParamIndex,
				customIdParams.slice(lastParamIndex).join(":"),
			);
		}

		payload = customIdParams.reduce((payloadData, arg, index) => {
			const key = payloadKeys[index];
			if (arg === "") payloadData[key] = undefined;
			else if (componentPayload[key] === "string") payloadData[key] = arg;
			else if (componentPayload[key] === "number") payloadData[key] = +arg;
			else if (componentPayload[key] === "boolean") payloadData[key] = Boolean(+arg);

			return payloadData;
		}, {});
	}

	return payload;
}

/**
 * @template {BaseInteraction} [Interaction=BaseInteraction<"cached">]
 * @template {{ [name: string]: "string" | "number" | "boolean" }} CustomIdPayloadTypes
 */
module.exports = class BaseCustomIdInteractionExecutor {
	/**
	 * @param {object} data Данные обработчика
	 * @param {string} data.customId ID компонента
	 * @param {CustomIdPayloadTypes} [data.customIdPayload = {}] Аргументы, которые могут находиться в customId
	 * @param {ExecuteFunction<Interaction, CustomIdPayloadTypes>} [data.execute] Функция для вызова команды
	 */
	constructor(data) {
		this.customId = data.customId;
		/** @private */
		this._customIdPayload = data.customIdPayload ?? {};
		/** @private */
		this._execute = data.execute;
	}
	/**
	 * Функция для вызова команды
	 * @param {MessageComponentInteraction | ModalSubmitInteraction} interaction Объект взаимодействия с командой
	 * @param {BotInfo} botInfo Информация об обработчиках бота
	 */
	async execute(interaction, botInfo) {
		await this._execute(interaction, calculatePayload(interaction.customId, this._customIdPayload), botInfo);
	}
};
