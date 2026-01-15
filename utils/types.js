/**
 * @import { CronJob } from "cron"
 * @import { CommandInteraction, ButtonInteraction, ModalSubmitInteraction, ModalMessageModalSubmitInteraction, SelectMenuType, ClientEvents } from "discord.js"
 *
 * @import Module from "../classes/Module"
 * @import ChatInputCommand from "../classes/ChatInputCommand"
 * @import UserContextMenuCommand from "../classes/UserContextMenuCommand"
 * @import MessageContextMenuCommand from "../classes/MessageContextMenuCommand"
 * @import Button from "../classes/Button"
 * @import Modal from "../classes/Modal"
 * @import Event from "../classes/Event"
 * @import SelectMenu from "../classes/SelectMenu"
 */

/**
 * @typedef BotInfo
 * @property {Module[]} modules Модули бота
 * @property {ChatInputCommand<Module, boolean>[]} chatInputCommands Обработчики команд бота
 * @property {UserContextMenuCommand<Module, boolean>[]} userContextMenuCommands Обработчики контекстных команд пользователя бота
 * @property {MessageContextMenuCommand<Module, boolean>[]} messageContextMenuCommands Обработчики контекстных команд сообщения бота
 * @property {Button<Module, ButtonInteraction>[]} buttons Обработчики кнопок бота
 * @property {Modal<Module, boolean, ModalSubmitInteraction | ModalMessageModalSubmitInteraction>[]} modals Обработчики модалок бота
 * @property {SelectMenu<Module, SelectMenuType, boolean>[]} selectMenus Обработчики меню бота
 * @property {(Event<Module, boolean, keyof ClientEvents> & { module: Module })[]} events Обработчики событий бота
 * @property {CronJob[]} schedules Задачи
 */

/**
 * @template {CommandInteraction} [InteractionType=CommandInteraction]
 * Функция для вызова команды
 * @callback CommandExecuteFunction
 * @param {InteractionType} interaction Взаимодействие с командой
 * @param {BotInfo} botInfo Данные обработчиков бота
 * @returns {*}
 */

/**
 * @template T
 * @typedef {T extends "string" ? string : T extends "number" ? number : T extends "boolean" ? boolean : *} MapSchemaType
 */

/**
 * @template {{ [name: string]: "string" | "number" | "boolean" }} CustomIdPayloadTypes
 * @typedef {{ [K in keyof CustomIdPayloadTypes]?: MapSchemaType<CustomIdPayloadTypes[K]> }} CustomIdPayload
 */

// Требуется для корректного экспорта типов
module.exports = {};
