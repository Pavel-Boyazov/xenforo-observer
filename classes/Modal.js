/**
 * @import { If, ModalMessageModalSubmitInteraction, ModalSubmitInteraction } from "discord.js"
 *
 * @import { CustomIdPayload } from "../utils/types"
 */

const BaseCustomIdInteractionExecutor = require("./BaseCustomIdInteractionExecutor");

/**
 * @template {boolean} [IsFromMessage=false]
 * @template {If<IsFromMessage, ModalMessageModalSubmitInteraction, ModalSubmitInteraction>} [Interaction=If<IsFromMessage, ModalMessageModalSubmitInteraction<"cached">, ModalSubmitInteraction<"cached">>]
 * @template {{ [name: string]: "string" | "number" | "boolean" }} CustomIdPayloadTypes
 * Функция для вызова обработки
 * @callback ExecuteFunction
 * @param {Interaction} interaction Взаимодействие с меню выбора
 * @param {CustomIdPayload<CustomIdPayloadTypes>} payload Полезная нагрузка из customId
 * @returns {*}
 */

/**
 * @template {boolean} [IsFromMessage=false]
 * @template {If<IsFromMessage, ModalMessageModalSubmitInteraction, ModalSubmitInteraction>} [Interaction=If<IsFromMessage, ModalMessageModalSubmitInteraction<"cached">, ModalSubmitInteraction<"cached">>]
 * @template {{ [name: string]: "string" | "number" | "boolean" }} CustomIdPayloadTypes
 * @augments BaseCustomIdInteractionExecutor<Interaction,CustomIdPayloadTypes>
 */
module.exports = class Modal extends BaseCustomIdInteractionExecutor {
	/**
	 * @param {object} data Данные модалки
	 * @param {string} data.customId ID модалки
	 * @param {CustomIdPayloadTypes} [data.customIdPayload = {}] Аргументы, которые могут находиться в customId
	 * @param {ExecuteFunction<IsFromMessage, Interaction, CustomIdPayloadTypes>} [data.execute] Функция для вызова
	 */
	// eslint-disable-next-line no-useless-constructor
	constructor(data) {
		super(data);
	}
};
