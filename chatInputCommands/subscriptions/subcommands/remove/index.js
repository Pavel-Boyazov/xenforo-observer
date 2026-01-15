/**
 * @import { LinkType } from "../../../../../../prisma/generated"
 */

const { PrismaClientKnownRequestError } = require("@prisma/client/runtime/client");
const { ApplicationCommandOptionType, MessageFlags, bold, hyperlink, Locale } = require("discord.js");

const Subcommand = require("../../../../classes/Subcommand");
const { unsubscribe } = require("../../../../mfunc");
const { $Enums } = require("../../../../prisma/generated");
const { urlRegex, apiInstance } = require("../../../../utils");

module.exports = new Subcommand({
	discordData: {
		name: "удалить",
		nameLocalizations: {
			[Locale.EnglishUS]: "remove",
			[Locale.EnglishGB]: "remove",
		},
		description: "Отписаться от уведомлений",
		options: [
			{
				type: ApplicationCommandOptionType.String,
				name: "ссылка",
				nameLocalizations: {
					[Locale.EnglishUS]: "url",
					[Locale.EnglishGB]: "url",
				},
				description: "Ссылка на отслеживаемый форум/тему/сообщение",
				autocomplete: true,
				required: true,
				minLength: 31,
			},
		],
	},
	execute(interaction) {
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
		/** @type {LinkType} */
		let linkType;

		if (urlType === "forums") linkType = $Enums.LinkType.FORUM;
		else linkType = $Enums.LinkType.THREAD;

		return unsubscribe({
			targetId_linkType_linkId: {
				targetId: interaction.user.id,
				linkType: linkType,
				linkId: postId ?? +id,
			},
		})
			.then(async () => {
				let typeString;

				switch (linkType) {
					case $Enums.LinkType.FORUM:
						typeString = "форума";
						break;
					case $Enums.LinkType.THREAD:
						typeString = "темы";
						break;
				}

				let title;

				try {
					if (linkType === $Enums.LinkType.FORUM)
						await apiInstance.get(`/forums/${id}`).then(({ data }) => {
							title = data.forum.title;
						});
					else
						await apiInstance.get(`/threads/${id}`).then(({ data }) => {
							title = data.thread.title;
						});
				} catch (error) {
					if (error.status !== 403 && error.status !== 404) console.error(error);
				}

				return interaction.reply({
					content:
						`Вы отписались от обновлений ${typeString} ` +
						bold(title ? hyperlink(title, url.toString()) : url.toString()),
					flags: MessageFlags.Ephemeral,
				});
			})
			.catch((err) => {
				if (err instanceof PrismaClientKnownRequestError && err.code === "P2025")
					return interaction.reply({
						content: "Данная подписка уже отсутсвует, вам не будут присылаться обновления",
						flags: MessageFlags.Ephemeral,
					});

				console.error(err);

				return interaction.reply({
					content: "К сожалению, не удалось отписаться от обновлений. Повторите попытку позже",
					flags: MessageFlags.Ephemeral,
				});
			});
	},
});
