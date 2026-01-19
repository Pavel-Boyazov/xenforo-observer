const { AxiosError } = require("axios");
const { MessageFlags, ContainerBuilder, ComponentType, subtext } = require("discord.js");

const Modal = require("../classes/Modal");
const { subscriptions } = require("../mfunc");
const { $Enums } = require("../prisma/generated");
const { apiInstance, suppressHides, botColors } = require("../utils");

/** @type {Modal<undefined, true>} */
module.exports = new Modal({
	customId: "moderate",
	customIdPayload: { subscriptionId: "number", newId: "number" },
	async execute(interaction, { subscriptionId, newId }) {
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

		let thread_id;
		let postInfo;
		switch (subscription.linkType) {
			case $Enums.LinkType.FORUM:
				thread_id = newId;
				break;
			case $Enums.LinkType.THREAD:
				thread_id = subscription.linkId;
				if (subscription.filterPostId)
					try {
						await apiInstance.get(`/posts/${newId}`).then(({ data }) => {
							postInfo = data.post;
						});
					} catch (err) {
						if (err instanceof AxiosError) {
							if (err.status === 404)
								return interaction.reply({
									content: "Пост, к которому относится уведомление не существует",
									flags: MessageFlags.Ephemeral,
								});

							console.error(err.response.data);
						} else console.error(err);

						return interaction.reply({
							content: "При проверке поста произошла неизвестная ошибка. Повторите попытку позже",
							flags: MessageFlags.Ephemeral,
						});
					}
				break;
		}

		const text = interaction.fields.getTextInputValue("text");

		if (text) {
			let quote = "";

			if (subscription.filterPostId)
				quote = `[QUOTE="${postInfo.username}, post: ${newId}, member: ${postInfo.user_id}"]
${suppressHides(postInfo.message)}
[/QUOTE]
`;

			try {
				await apiInstance.post("/posts", undefined, {
					params: {
						thread_id,
						message: quote + `[CENTER]${text}[/CENTER]\n\n[SIZE=1]Ответил: ${interaction.user.id}[/SIZE]`,
					},
				});
			} catch (err) {
				if (err instanceof AxiosError) console.error(err.response.data);
				else console.error(err);

				return interaction.reply({
					content: "При ответе произошла неизвестная ошибка. Повторите попытку позже",
					flags: MessageFlags.Ephemeral,
				});
			}
		}

		const prefixes = interaction.fields.fields.get("prefixes")?.values ?? [];
		const actions = interaction.fields.fields.get("actions")?.values ?? [];

		if (prefixes.length || actions.length) {
			const params = {};

			if (prefixes.length) params.prefix_id = prefixes[0];
			if (actions.includes("pin")) params.sticky = true;
			if (actions.includes("close")) params.discussion_open = false;

			try {
				await apiInstance.post(`/threads/${thread_id}`, undefined, { params });
			} catch (err) {
				if (err instanceof AxiosError) console.error(err.response.data);
				else console.error(err);

				return interaction.reply({
					content: `При изменении темы произошла неизвестная ошибка. Повторите попытку позже${
						text
							? `
Ответ на тему был успешно опубликован`
							: ""
					}`,
					flags: MessageFlags.Ephemeral,
				});
			}
		}

		const container = new ContainerBuilder(interaction.message.components[0].toJSON());
		const actionRowComponentIndex = container.components.findIndex(({ data }) => data.type === ComponentType.ActionRow);

		container.components = container.components.slice(0, actionRowComponentIndex);

		if (container.data.accent_color !== botColors.green) container.setAccentColor(botColors.green);

		container.addTextDisplayComponents({ content: subtext(`Обработал: ${interaction.user}`) });

		return interaction
			.update({ components: [container] })
			.then(() => interaction.followUp({ content: "Тема обработана", flags: MessageFlags.Ephemeral }));
	},
});
