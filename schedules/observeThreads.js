/**
 * @import { Client, GuildTextBasedChannel } from "discord.js"
 */

const { CronJob } = require("cron");
const {
	MessageFlags,
	ContainerBuilder,
	bold,
	hyperlink,
	heading,
	HeadingLevel,
	SeparatorBuilder,
	SectionBuilder,
	ThumbnailBuilder,
	TextDisplayBuilder,
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
} = require("discord.js");

const { lastIds, getLinks } = require("../mfunc");
const { $Enums } = require("../prisma/generated");
const { bbToMarkdown } = require("../utils");
const { apiInstance } = require("../utils/constants");

module.exports = new CronJob(
	"0 * * * * *",
	function onTick() {
		return apiInstance
			.get("/threads", { params: { order: "post_date", direction: "desc" } })
			.then(async ({ data: threadsData }) => {
				const idData = await lastIds.get();
				const newThreads = idData
					? threadsData.threads.filter(({ thread_id: threadId }) => threadId > idData.lastThreadId)
					: threadsData.threads;

				if (!newThreads.length) return;

				const links = await getLinks({ type: $Enums.LinkType.FORUM });
				const threadsToNotify = newThreads.filter((thread) => links.some(({ id }) => thread.node_id === id));

				if (threadsToNotify.length) {
					const client = this.client;

					await Promise.all([
						...threadsToNotify.flatMap((thread) =>
							links
								.filter(({ id }) => thread.node_id === id)
								.flatMap(async ({ subscriptions }) => {
									const firstPost = await apiInstance
										.get(`/posts/${thread.first_post_id}`)
										.then(({ data }) => data.post)
										.catch(console.error);

									return subscriptions
										.filter(
											({ filterPrefixesIds }) =>
												!filterPrefixesIds?.length ||
												(thread.sv_prefix_ids.length &&
													filterPrefixesIds.every((prefixId) => thread.sv_prefix_ids.includes(prefixId))),
										)
										.map((subscription) => {
											const container = new ContainerBuilder()
												.setAccentColor(0xffffff)
												.addTextDisplayComponents({
													content: heading(
														`На форуме ${bold(hyperlink(thread.Forum.title, thread.Forum.view_url))} ` +
															"создана новая тема!",
													),
												})
												.addSeparatorComponents(new SeparatorBuilder())
												.addTextDisplayComponents({
													content: heading(hyperlink(thread.title, thread.view_url), HeadingLevel.Three),
												})
												.addSeparatorComponents(new SeparatorBuilder({ divider: false }));

											if (thread.User.avatar_urls.l)
												container.addSectionComponents(
													new SectionBuilder()
														.setThumbnailAccessory(
															new ThumbnailBuilder({
																media: { url: thread.User.avatar_urls.l },
																description: "Аватар автора",
															}),
														)
														.addTextDisplayComponents(
															new TextDisplayBuilder({
																content: firstPost
																	? bbToMarkdown(firstPost.message, 1e3)
																	: "Не удалось получить информацию о сообщении",
															}),
														),
												);
											else
												container.addTextDisplayComponents({
													content: firstPost
														? bbToMarkdown(firstPost.message, 1e3)
														: "Не удалось получить информацию о сообщении",
												});

											container.addSeparatorComponents(new SeparatorBuilder()).addTextDisplayComponents({
												content: `Автор: ${bold(hyperlink(thread.User.username, thread.User.view_url))}`,
											});

											if (subscription.guildId && subscription.moderatorRolesIds?.length && thread.discussion_open)
												container.addSeparatorComponents(new SeparatorBuilder()).addActionRowComponents(
													new ActionRowBuilder({
														components: [
															new ButtonBuilder({
																customId: `markAsInProcess:${subscription.id}`,
																emoji: "⏰",
																style: ButtonStyle.Primary,
																label: "Пометить как в обработке",
															}),
															new ButtonBuilder({
																customId: `moderate:${subscription.id}:${thread.thread_id}`,
																emoji: "✍️",
																style: ButtonStyle.Success,
																label: "Обработать",
															}),
														],
													}),
												);

											// TODO: Пофиксить allowedMentions
											return subscription.guildId
												? client.channels.fetch(subscription.targetId, { allowUnknownGuild: true }).then(
														/** @param {GuildTextBasedChannel} channel Канал для отправки уведомления */
														(channel) =>
															channel.send({
																components: [container],
																flags: MessageFlags.IsComponentsV2,
																allowedMentions: { parse: [] },
															}),
													)
												: client.users.send(subscription.targetId, {
														components: [
															container.addSeparatorComponents(new SeparatorBuilder()).addActionRowComponents({
																components: [
																	new ButtonBuilder({
																		label: "Отписаться",
																		emoji: "🔕",
																		customId: `unsubscribe:${subscription.id}`,
																		style: ButtonStyle.Danger,
																	}),
																],
															}),
														],
														flags: MessageFlags.IsComponentsV2,
														allowedMentions: { parse: [] },
													});
										});
								}),
						),
					]);
				}

				return lastIds.update({ lastThreadId: threadsData.threads[0].thread_id });
			})
			.catch(console.error);
	},
	null,
	null,
	null,
	/** @type {{ client: Client }} */ ({ client: undefined }),
);
