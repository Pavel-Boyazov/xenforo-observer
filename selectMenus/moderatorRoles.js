const { PrismaClientKnownRequestError } = require("@prisma/client/runtime/client");
const {
	ComponentType,
	MessageFlags,
	LabelBuilder,
	TextInputBuilder,
	TextInputStyle,
	StringSelectMenuBuilder,
} = require("discord.js");

const SelectMenu = require("../classes/SelectMenu");
const { subscriptions } = require("../mfunc");
const { $Enums } = require("../prisma/generated");
const { apiInstance } = require("../utils");

module.exports = new SelectMenu({
	type: ComponentType.RoleSelect,
	customId: "moderatorRoles",
	customIdPayload: { subscriptionId: "number" },
	async execute(interaction, { subscriptionId }) {
		let linkType, linkId;

		try {
			({ linkType, linkId } = await subscriptions.update(subscriptionId, { moderatorRolesIds: interaction.values }));
		} catch (err) {
			if (err instanceof PrismaClientKnownRequestError && err.code === "P2025")
				return interaction.reply({
					content: "Подписка уже истекла или была удалена",
					flags: MessageFlags.Ephemeral,
				});

			console.error(err);

			return interaction.reply({
				content: "Произошла неизвестная ошибка при установке ролей. Повторите попытку позже",
				flags: MessageFlags.Ephemeral,
			});
		}

		let prefixes;
		const components = [
			new LabelBuilder({
				label: "Текст ответа",
				description: "Модератор сможет отказаться от него или поправить",
				component: new TextInputBuilder({
					customId: "text",
					style: TextInputStyle.Paragraph,
					placeholder: "Текст по умолчанию",
					required: false,
				}),
			}),
		];

		if (linkType === $Enums.LinkType.FORUM) {
			try {
				await apiInstance.get(`/forums/${linkId}`).then(({ data }) => {
					prefixes = data.forum.type_data.prefixes;
				});
			} catch (error) {
				if (error.status === 403)
					return interaction.reply({
						content: "Данная ссылка находится под защитой, вы не можете подписаться на её обновления",
						flags: MessageFlags.Ephemeral,
					});
				else if (error.status === 404)
					return interaction.reply({
						content: "Отправленная вами ссылка не найдена. Убедитесь, что вы ввели всё верно",
						flags: MessageFlags.Ephemeral,
					});

				console.error(error);

				return interaction.reply({
					content: "При проверке ссылки произошла неизвестная ошибка. Повторите попытку позже",
					flags: MessageFlags.Ephemeral,
				});
			}

			if (prefixes.length)
				components.push(
					new LabelBuilder({
						label: "Префиксы при ответе",
						description: "Модератор сможет отказаться от них или поправить",
						component: new StringSelectMenuBuilder({
							customId: "prefixes",
							placeholder: "Префиксы по умолчанию",
							options: prefixes
								.map((prefix) => ({ label: prefix.title, value: prefix.prefix_id.toString() }))
								.slice(0, 25),
							minValues: 0,
							// MaxValues: prefixes.length,
							required: false,
						}),
					}),
				);

			components.push(
				new LabelBuilder({
					label: "Дополнительные действия",
					description: "Модератор сможет отказаться от них или поправить",
					component: new StringSelectMenuBuilder({
						customId: "actions",
						placeholder: "Действия по умолчанию",
						options: [
							{
								label: "Закрепить тему",
								emoji: "📌",
								value: "pin",
							},
							{
								label: "Закрыть тему",
								emoji: "🔒",
								value: "close",
							},
						],
						minValues: 0,
						maxValues: 2,
						required: false,
					}),
				}),
			);
		}

		return interaction.showModal({
			customId: `setDefaultAnswer:${subscriptionId}`,
			title: "Стандартные настройки",
			components,
		});
	},
});
