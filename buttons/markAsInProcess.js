const { ContainerBuilder, subtext, MessageFlags, ComponentType } = require("discord.js");

const Button = require("../classes/Button");
const { subscriptions } = require("../mfunc");
const { botColors } = require("../utils");

module.exports = new Button({
	customId: "markAsInProcess",
	customIdPayload: { subscriptionId: "number" },
	async execute(interaction, { subscriptionId }) {
		const subscription = await subscriptions.get(subscriptionId).catch(console.error);

		if (subscription === null)
			return interaction.reply({
				content: "Подписка была удалена, действия невозможны",
				flags: MessageFlags.Ephemeral,
			});
		else if (subscription === undefined)
			return interaction.reply({
				content: "При получении информации о подписке произошла неизвестная ошибка. Повторите попытку позже",
				flags: MessageFlags.Ephemeral,
			});
		else if (!interaction.member.roles.cache.hasAny(...subscription.moderatorRolesIds))
			return interaction.reply({
				content: "У вас отсутствует доступ для обработки уведомлений",
				flags: MessageFlags.Ephemeral,
			});

		const container = new ContainerBuilder(interaction.message.components[0].toJSON());

		if (container.data.accent_color !== botColors.red) container.setAccentColor(botColors.red);

		const textComponent = container.components[container.components.length - 1];

		if (textComponent.data.type === ComponentType.TextDisplay)
			textComponent.setContent(subtext(`Обрабатывает: ${interaction.user}`));
		else container.addTextDisplayComponents({ content: subtext(`Обрабатывает: ${interaction.user}`) });

		return interaction.update({ components: [container] });
	},
});
