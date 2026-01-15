/**
 * @import { GuildTextBasedChannel } from "discord.js"
 */

const { PrismaClientKnownRequestError } = require("@prisma/client/runtime/client");
const {
	ApplicationCommandOptionType,
	MessageFlags,
	bold,
	ChannelType,
	hyperlink,
	Locale,
	ActionRowBuilder,
	StringSelectMenuBuilder,
	RoleSelectMenuBuilder,
	TextDisplayBuilder,
} = require("discord.js");

const Subcommand = require("../../../classes/Subcommand");
const { subscribe } = require("../../../mfunc");
const { $Enums } = require("../../../prisma/generated");
const { rssInstance, apiInstance, urlRegex } = require("../../../utils");

module.exports = new Subcommand({
	discordData: {
		name: "добавить",
		nameLocalizations: {
			[Locale.EnglishUS]: "add",
			[Locale.EnglishGB]: "add",
		},
		description: "Подписать канал на обновления",
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
			{
				type: ApplicationCommandOptionType.Channel,
				name: "канал",
				nameLocalizations: {
					[Locale.EnglishUS]: "channel",
					[Locale.EnglishGB]: "channel",
				},
				description: "Канал, в который будут отправляться уведомления (текущий если не указано)",
				channelTypes: [
					ChannelType.GuildText,
					ChannelType.GuildVoice,
					ChannelType.PublicThread,
					ChannelType.PrivateThread,
					ChannelType.GuildStageVoice,
					ChannelType.GuildAnnouncement,
					ChannelType.AnnouncementThread,
				],
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
			else if (type === $Enums.LinkType.THREAD)
				await apiInstance.get(`/threads/${id}`).then(({ data }) => {
					title = data.thread.title;
				});
			else title = id;
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

		/** @type {GuildTextBasedChannel} */
		const channel = interaction.options.getChannel("канал") ?? interaction.channel;
		const linkUnique = { type_id: { type, id: +id } };

		return subscribe({
			targetId: channel.id,
			channelId: channel.isThread() ? channel.parentId : undefined,
			guildId: interaction.guildId,
			link: { connectOrCreate: { where: linkUnique, create: { type, id: +id } } },
			filterPostId: postId,
			logs: {
				create: {
					type: $Enums.ActionType.CREATE,
					guildId: interaction.guildId,
					executorId: interaction.user.id,
					link: { connect: linkUnique },
				},
			},
		})
			.then(({ id: entryId }) => {
				let typeString;

				switch (type) {
					case $Enums.LinkType.FORUM:
						typeString = "форума";
						break;
					case $Enums.LinkType.THREAD:
						typeString = "темы";
						break;
				}

				const components = [
					new TextDisplayBuilder({
						content:
							`Вы подписали канал ${channel} на обновления ${typeString} ` + bold(hyperlink(title, url.toString())),
					}),
				];

				if (type === $Enums.LinkType.FORUM)
					components.push(
						new TextDisplayBuilder({
							content: "Ниже вы можете настроить префиксы, которые обязана иметь тема для уведомления",
						}),
						new ActionRowBuilder().addComponents(
							new StringSelectMenuBuilder({
								customId: `filterPrefixes:${entryId}`,
								minValues: 0,
								// MaxValues: prefixes.length,
								options: prefixes.map((prefix) => ({
									label: prefix.title,
									value: prefix.prefix_id.toString(),
								})),
								placeholder: "Префиксы для фильтрации",
							}),
						),
					);

				components.push(
					new TextDisplayBuilder({
						content:
							"Также вы можете добавить возможность обработки уведомлений. " +
							"У уведомлений связанных с незакрытими темами появится возможность " +
							"автоматической или ручной обработки выбранными ролями",
					}),
					new ActionRowBuilder().addComponents(
						new RoleSelectMenuBuilder({
							customId: `moderatorRoles:${entryId}`,
							placeholder: "Выберите роли модераторов",
							maxValues: interaction.guild.roles.cache.size >= 25 ? 25 : interaction.guild.roles.cache.size,
						}),
					),
				);

				return interaction
					.reply({ components, flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2] })
					.catch(console.error);
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
