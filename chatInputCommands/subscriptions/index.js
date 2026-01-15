const { Locale } = require("discord.js");

const ChatInputCommand = require("../../classes/ChatInputCommand");

const command = new ChatInputCommand({
	discordData: {
		name: "подписки",
		nameLocalizations: {
			[Locale.EnglishUS]: "subscriptions",
			[Locale.EnglishGB]: "subscriptions",
		},
		description: "Управление вашими подписками",
	},
});

// eslint-disable-next-line jsdoc/no-undefined-types
/** @typedef {typeof command} CommandType */

module.exports = command;
