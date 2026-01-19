const { PrismaClientKnownRequestError } = require("@prisma/client/runtime/client");
const { ComponentType, MessageFlags } = require("discord.js");

const SelectMenu = require("../classes/SelectMenu");
const { subscriptions } = require("../mfunc");

module.exports = new SelectMenu({
	type: ComponentType.StringSelect,
	customId: "filterPrefixes",
	customIdPayload: { subscriptionId: "number" },
	async execute(interaction, { subscriptionId }) {
		try {
			await subscriptions.update(subscriptionId, { filterPrefixesIds: interaction.values.map(Number).sort() });
		} catch (err) {
			if (err instanceof PrismaClientKnownRequestError && err.code === "P2025")
				return interaction.reply({
					content: "Подписка уже истекла или была удалена",
					flags: MessageFlags.Ephemeral,
				});

			console.error(err);

			return interaction.reply({
				content: "Произошла неизвестная ошибка при установке фильтра. Повторите попытку позже",
				flags: MessageFlags.Ephemeral,
			});
		}

		return interaction.reply({
			content: "Фильтр префиксов тем успешно установлен",
			flags: MessageFlags.Ephemeral,
		});
	},
});
