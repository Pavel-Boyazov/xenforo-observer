/**
 * @import { MappedInteractionTypes, SelectMenuType } from "discord.js"
 */

const BaseCustomIdInteractionExecutor = require("./BaseCustomIdInteractionExecutor");

/**
 * @template {SelectMenuType} [CurrentSelectMenuType=SelectMenuType]
 * @typedef AdditionalProperties Дополнительные свойства принимаемые конструктором
 * @property {CurrentSelectMenuType} [type] Тип меню выбора
 */

/**
 * @template {SelectMenuType} [CurrentSelectMenuType=SelectMenuType]
 * @template {boolean} [Cached=true]
 * @template {{ [name: string]: "string" | "number" | "boolean" }} [CustomIdPayloadTypes={}]
 * @typedef {AdditionalProperties<CurrentSelectMenuType> &
 *	ConstructorParameters<typeof BaseCustomIdInteractionExecutor<InteractionType<Cached,CurrentSelectMenuType>, CustomIdPayloadTypes>>[0]
 *} ConstructorData
 */

/**
 * @template {SelectMenuType} [CurrentSelectMenuType=SelectMenuType]
 * @template {boolean} [Cached=true]
 * @template {{ [name: string]: "string" | "number" | "boolean" }} CustomIdPayloadTypes
 * @augments BaseCustomIdInteractionExecutor<InteractionType<Cached,CurrentSelectMenuType>,CustomIdPayloadTypes>
 */
module.exports = class SelectMenu extends BaseCustomIdInteractionExecutor {
	/**
	 * @template {boolean} [Cached=true]
	 * @template {SelectMenuType} [CurrentSelectMenuType=SelectMenuType]
	 * @typedef {MappedInteractionTypes<Cached>[CurrentSelectMenuType]} InteractionType
	 */
	/** @param {ConstructorData<CurrentSelectMenuType, Cached, CustomIdPayloadTypes>} data Данные обработчика */
	constructor(data) {
		super(data);
		this.type = data.type;
	}
};
