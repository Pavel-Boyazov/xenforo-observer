const {
	MessageFlags,
	LabelBuilder,
	TextInputBuilder,
	TextInputStyle,
	StringSelectMenuBuilder,
	ContainerBuilder,
	ComponentType,
	subtext,
} = require("discord.js");

const Button = require("../classes/Button");
const { get } = require("../mfunc");
const { $Enums } = require("../prisma/generated");
const { apiInstance, botColors } = require("../utils");

module.exports = new Button({
	customId: "moderate",
	customIdPayload: { subscriptionId: "number", newId: "number" },
	async execute(interaction, { subscriptionId, newId }) {
		const subscription = await get(subscriptionId).catch(console.error);

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

		let prefixes;
		const components = [
			new LabelBuilder({
				label: "Текст ответа",
				description: "Оставьте пустым если не хотите отвечать. Центрирование по умолчанию",
				component: new TextInputBuilder({
					customId: "text",
					style: TextInputStyle.Paragraph,
					required: false,
					value: subscription?.defaultText ?? undefined,
				}),
			}),
		];

		if (subscription.linkType === $Enums.LinkType.FORUM) {
			try {
				await apiInstance.get(`/forums/${subscription.linkId}`).then(({ data }) => {
					prefixes = data.forum.type_data.prefixes;
				});
			} catch (err) {
				if (err.status === 404)
					return interaction.reply({
						content: "Форум, к которому относится уведомление не существует",
						flags: MessageFlags.Ephemeral,
					});

				console.error(err);

				return interaction.reply({
					content: "При проверке форума произошла неизвестная ошибка. Повторите попытку позже",
					flags: MessageFlags.Ephemeral,
				});
			}

			if (prefixes.length)
				components.push(
					new LabelBuilder({
						label: "Префикс темы",
						description: "Префикс, который будет установлен после ответа",
						component: new StringSelectMenuBuilder({
							customId: "prefixes",
							options: prefixes.map((prefix) => ({
								label: prefix.title,
								value: prefix.prefix_id.toString(),
								default: subscription.defaultPrefixesIds?.includes(prefix.prefix_id),
							})),
							minValues: 0,
							// MaxValues: prefixes.length,
							required: false,
						}),
					}),
				);

			components.push(
				new LabelBuilder({
					label: "Дополнительные действия",
					component: new StringSelectMenuBuilder({
						customId: "actions",
						options: [
							{
								label: "Закрепить тему",
								emoji: "📌",
								value: "pin",
								default: subscription.defaultActions?.includes("pin"),
							},
							{
								label: "Закрыть тему",
								emoji: "🔒",
								value: "close",
								default: subscription.defaultActions?.includes("close"),
							},
						],
						minValues: 0,
						maxValues: 2,
						required: false,
					}),
				}),
			);
		}

		const container = new ContainerBuilder(interaction.message.components[0].toJSON());

		if (container.data.accent_color !== botColors.red) container.setAccentColor(botColors.red);

		const textComponent = container.components[container.components.length - 1];

		if (textComponent.data.type === ComponentType.TextDisplay)
			textComponent.setContent(subtext(`Обрабатывает: ${interaction.user}`));
		else container.addTextDisplayComponents({ content: subtext(`Обрабатывает: ${interaction.user}`) });

		if (interaction.message.editable) await interaction.message.edit({ components: [container] });

		return interaction.showModal({
			title: "Обработка темы",
			customId: `moderate:${subscriptionId}:${newId}`,
			components,
		});
	},
});
