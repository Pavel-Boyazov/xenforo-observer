const { PrismaClientKnownRequestError } = require("@prisma/client/runtime/client");
const {
	ApplicationCommandOptionType,
	MessageFlags,
	bold,
	time,
	TimestampStyles,
	hyperlink,
	Locale,
	ActionRowBuilder,
	StringSelectMenuBuilder,
} = require("discord.js");

const Subcommand = require("../../../classes/Subcommand");
const { subscribe } = require("../../../mfunc");
const { $Enums } = require("../../../prisma/generated");
const { rssInstance, apiInstance, urlRegex } = require("../../../utils");

/** @type {Subcommand<import("..").CommandType>} */
module.exports = new Subcommand({
	discordData: {
		name: "добавить",
		nameLocalizations: {
			[Locale.EnglishUS]: "add",
			[Locale.EnglishGB]: "add",
		},
		description: "Подписаться на обновления",
		options: [
			{
				type: ApplicationCommandOptionType.String,
				name: "ссылка",
				nameLocalizations: {
					[Locale.EnglishUS]: "url",
					[Locale.EnglishGB]: "url",
				},
				description: "Ссылка на форум/тему/сообщение для отслеживания",
				required: true,
				minLength: 31,
			},
		],
	},
	async execute(interaction) {
		let url;
		try {
			url = new URL(interaction.options.getString("ссылка", true));
		} catch (error) {
			if (error.message === "Invalid URL")
				return interaction.reply({
					content: "Пришлите ссылку верного формата",
					flags: MessageFlags.Ephemeral,
				});

			console.error(error);

			return interaction.reply({ content: "При чтении ссылки произошла ошибка", flags: MessageFlags.Ephemeral });
		}

		if (url.host !== "forum.arzguard.com")
			return interaction.reply({
				content: "Бот поддерживает только https://forum.arzguard.com/",
				flags: MessageFlags.Ephemeral,
			});

		const { type: urlType, id, post_id: postId } = url.pathname.match(urlRegex).groups;
		let type;

		if (urlType === "forums") type = $Enums.LinkType.FORUM;
		else type = $Enums.LinkType.THREAD;

		try {
			let path;

			if (type === $Enums.LinkType.FORUM) path = `/forums/${id}`;
			else path = `/threads/${id}`;

			await rssInstance.get(path);
		} catch (error) {
			if (error.status === 403)
				return interaction.reply({
					content: "Данная ссылка находится под защитой, вы не можете подписаться на её обновления",
					flags: MessageFlags.Ephemeral,
				});

			console.error(error);

			return interaction.reply({
				content: "При проверке прав доступа произошла неизвестная ошибка. Повторите попытку позже",
				flags: MessageFlags.Ephemeral,
			});
		}

		let title;
		let prefixes;

		try {
			if (type === $Enums.LinkType.FORUM)
				await apiInstance.get(`/forums/${id}`).then(({ data }) => {
					title = data.forum.title;
					prefixes = data.forum.type_data.prefixes;
				});
			else
				await apiInstance.get(`/threads/${id}`).then(({ data }) => {
					title = data.thread.title;
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

		return subscribe({
			targetId: interaction.user.id,
			link: { connectOrCreate: { where: { type_id: { type, id: +id } }, create: { type, id: +id } } },
			filterPostId: postId,
		})
			.then((entry) => {
				let typeString;

				switch (type) {
					case $Enums.LinkType.FORUM:
						typeString = "форума";
						break;
					case $Enums.LinkType.THREAD:
						typeString = "темы";
						break;
				}

				return interaction.reply({
					content:
						`Вы подписались на обновления ${typeString} ${bold(hyperlink(title, url.toString()))}. ` +
						"Они перестанут приходить " +
						time(new Date(+entry.createdAt + 259_200e3), TimestampStyles.RelativeTime) +
						", после этого подписку придётся обновить",
					components:
						type === $Enums.LinkType.FORUM
							? [
									new ActionRowBuilder().addComponents(
										new StringSelectMenuBuilder({
											customId: `filterPrefixes:${entry.id}`,
											minValues: 0,
											// MaxValues: prefixes.length,
											options: prefixes.map((prefix) => ({ label: prefix.title, value: prefix.prefix_id.toString() })),
											placeholder: "Отображать только с префиксами",
										}),
									),
								]
							: [],
					flags: MessageFlags.Ephemeral,
				});
			})
			.catch((err) => {
				if (err instanceof PrismaClientKnownRequestError && err.code === "P2002")
					return interaction.reply({
						content: "У вас уже имеется подписка на данные обновления",
						flags: MessageFlags.Ephemeral,
					});

				console.error(err);

				return interaction.reply({
					content: "К сожалению, не удалось подписаться на обновления. Повторите попытку позже",
					flags: MessageFlags.Ephemeral,
				});
			});
	},
});
