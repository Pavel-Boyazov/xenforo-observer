const { Locale, PermissionFlagsBits, InteractionContextType, ApplicationIntegrationType } = require("discord.js");

const ChatInputCommand = require("../../classes/ChatInputCommand");

module.exports = new ChatInputCommand({
	discordData: {
		name: "подписки_сервера",
		nameLocalizations: {
			[Locale.EnglishUS]: "guild_subscriptions",
			[Locale.EnglishGB]: "guild_subscriptions",
		},
		description: "Управление подписками сервера",
		contexts: [InteractionContextType.Guild],
		integrationTypes: [ApplicationIntegrationType.GuildInstall],
		defaultMemberPermissions: PermissionFlagsBits.Administrator,
	},
});
