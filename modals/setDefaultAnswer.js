const { PrismaClientKnownRequestError } = require("@prisma/client/runtime/client");
const { MessageFlags } = require("discord.js");

const Modal = require("../classes/Modal");
const { subscriptions } = require("../mfunc");

module.exports = new Modal({
	customId: "setDefaultAnswer",
	customIdPayload: { subscriptionId: "number" },
	async execute(interaction, { subscriptionId }) {
		const defaultText = interaction.fields.getTextInputValue("text");
		const defaultPrefixesIds = interaction.fields.fields.get("prefixes")?.values ?? [];
		const defaultActions = interaction.fields.fields.get("actions")?.values ?? [];

		if (defaultText || defaultPrefixesIds.length || defaultActions.length)
			try {
				await subscriptions.update(subscriptionId, { defaultText, defaultPrefixesIds, defaultActions });
			} catch (err) {
				if (err instanceof PrismaClientKnownRequestError && err.code === "P2025")
					return interaction.reply({
						content: "Подписка уже истекла или была удалена",
						flags: MessageFlags.Ephemeral,
					});

				console.error(err);

				return interaction.reply({
					content:
						"Модерирующие роли успешно установлены, но при установке стандартных " +
						"настроек произошла неизвестная ошибка. Повторите попытку позже",
					flags: MessageFlags.Ephemeral,
				});
			}

		return interaction.reply({
			content: "Модерирующие роли и стандартные настройки успешно установлены",
			flags: MessageFlags.Ephemeral,
		});
	},
});
