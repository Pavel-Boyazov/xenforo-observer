/**
 * @import { ClientEvents, User } from "discord.js"
 *
 * @import { BotInfo } from "../utils/types"
 */

/**
 * @template {keyof ClientEvents} EventName
 * @template {ClientEvents[EventName]} [Args=ClientEvents[EventName]]
 * @typedef {[...Args, botInfo: BotInfo, formData?: { sender: User }]} ListenerArgs
 */

/**
 * @template {keyof ClientEvents} [EventName=keyof ClientEvents]
 * @template {ClientEvents[EventName]} [Args=ClientEvents[EventName]]
 * @typedef BaseConstructorData
 * @property {EventName} name Название события
 * @property {boolean} [once=false] Выполняется 1 раз?
 * @property {(...args: Args) => boolean} [filter] Функция для фильтрации событий
 * @property {(...args: ListenerArgs<EventName, Args>) => *} listener Слушатель события
 */

/**
 * @template {keyof ClientEvents} [EventName=keyof ClientEvents]
 * @template {ClientEvents[EventName]} [Args=ClientEvents[EventName]]
 */
module.exports = class Event {
	/** @param {BaseConstructorData<CustomEvent,EventName,Args>} data Данные об обработчике */
	constructor(data) {
		this.name = data.name;
		this.once = data.once ?? false;
		this.filter = data.filter;
		this.listener = data.listener;
	}
};
