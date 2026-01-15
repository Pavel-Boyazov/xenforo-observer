/**
 * @import { ClientEvents } from "discord.js"
 *
 * @import { BotInfo } from "./utils/types"
 * @import Button from "./classes/Button"
 * @import ChatInputCommand from "./classes/ChatInputCommand"
 * @import Event from "./classes/Event"
 * @import MessageContextMenuCommand from "./classes/MessageContextMenuCommand"
 * @import Modal from "./classes/Modal"
 * @import SelectMenu from "./classes/SelectMenu"
 * @import UserContextMenuCommand from "./classes/UserContextMenuCommand"
 */

const fs = require("fs");
const path = require("path");

const { Client, GatewayIntentBits } = require("discord.js");

try {
	require("dotenv/config");
	// eslint-disable-next-line no-unused-vars
} catch (_) {
	/* Empty */
}

const chatInputCommandsPath = path.join(__dirname, "chatInputCommands");
const userContextMenuCommandsPath = path.join(__dirname, "userContextMenuCommands");
const messageContextMenuCommandsPath = path.join(__dirname, "messageContextMenuCommands");
const buttonsPath = path.join(__dirname, "buttons");
const modalsPath = path.join(__dirname, "modals");
const selectMenusPath = path.join(__dirname, "selectMenus");
const eventsPath = path.join(__dirname, "events");
const schedulesPath = path.join(__dirname, "schedules");
/** @type {BotInfo} */
const botInfo = {
	chatInputCommands: fs.existsSync(chatInputCommandsPath)
		? fs.readdirSync(chatInputCommandsPath, { withFileTypes: true }).map((dirent) => {
				const commandPath = path.join(chatInputCommandsPath, dirent.name);
				/** @type {ChatInputCommand} */
				const command = require(commandPath);

				if (dirent.isDirectory()) command.registerSubclasses(commandPath);

				return command;
			})
		: [],
	userContextMenuCommands: fs.existsSync(userContextMenuCommandsPath)
		? fs
				.readdirSync(userContextMenuCommandsPath)
				.map(
					(commandFileName) =>
						/** @type {UserContextMenuCommand} */ (require(path.join(userContextMenuCommandsPath, commandFileName))),
				)
		: [],
	messageContextMenuCommands: fs.existsSync(messageContextMenuCommandsPath)
		? fs
				.readdirSync(messageContextMenuCommandsPath)
				.map(
					(commandFileName) =>
						/** @type {MessageContextMenuCommand} */ (
							require(path.join(messageContextMenuCommandsPath, commandFileName))
						),
				)
		: [],
	buttons: fs.existsSync(buttonsPath)
		? fs
				.readdirSync(buttonsPath)
				.map((buttonFileName) => /** @type {Button} */ (require(path.join(buttonsPath, buttonFileName))))
		: [],
	modals: fs.existsSync(modalsPath)
		? fs
				.readdirSync(modalsPath)
				.map((modalFileName) => /** @type {Modal} */ (require(path.join(modalsPath, modalFileName))))
		: [],
	selectMenus: fs.existsSync(selectMenusPath)
		? fs
				.readdirSync(selectMenusPath)
				.map(
					(selectMenuFileName) => /** @type {SelectMenu} */ (require(path.join(selectMenusPath, selectMenuFileName))),
				)
		: [],
	events: fs.existsSync(eventsPath)
		? fs
				.readdirSync(eventsPath)
				.map((eventFileName) => /** @type {Event} */ (require(path.join(eventsPath, eventFileName))))
		: [],
	schedules: fs.existsSync(schedulesPath)
		? fs.readdirSync(schedulesPath).map((scheduleFileName) => require(path.join(schedulesPath, scheduleFileName)))
		: [],
};

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

for (const event of botInfo.events) {
	const listener = async (/** @type {typeof event extends Event<*, infer Args> ? Args : never} */ ...args) => {
		if (event.filter?.(...args) === false) return;

		try {
			await event.listener(...args, botInfo);
		} catch (err) {
			console.error(err);
		}
	};

	if (event.once) client.once(/** @type {keyof ClientEvents} */ (event.name), listener);
	else client.on(/** @type {keyof ClientEvents} */ (event.name), listener);
}

client.login(process.env.DISCORD_TOKEN);
