const { Events } = require("discord.js");

const Event = require("../classes/Event");

module.exports = new Event({
	name: Events.InteractionCreate,
	listener(interaction, botInfo) {
		let interactionExecutor;

		if (interaction.isChatInputCommand() || interaction.isAutocomplete())
			interactionExecutor = botInfo.chatInputCommands.find(({ name }) => name === interaction.commandName);
		if (interaction.isUserContextMenuCommand())
			interactionExecutor = botInfo.userContextMenuCommands.find(({ name }) => name === interaction.commandName);
		if (interaction.isMessageContextMenuCommand())
			interactionExecutor = botInfo.messageContextMenuCommands.find(({ name }) => name === interaction.commandName);
		else if (interaction.isButton())
			interactionExecutor = botInfo.buttons.find(({ customId }) => customId === interaction.customId.split(":")[0]);
		else if (interaction.isModalSubmit())
			interactionExecutor = botInfo.modals.find(({ customId }) => customId === interaction.customId.split(":")[0]);
		else if (interaction.isAnySelectMenu())
			interactionExecutor = botInfo.selectMenus.find(
				({ customId, type }) => customId === interaction.customId.split(":")[0] && type === interaction.componentType,
			);
		if (!interactionExecutor) return;

		if (interaction.isAutocomplete()) return interactionExecutor.executeAutocomplete(interaction);
		else return interactionExecutor.execute(interaction, botInfo);
	},
});
