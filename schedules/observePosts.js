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
			.get("/threads", { params: { order: "last_post_date", direction: "desc" } })
			.then(async ({ data: { threads: threadsData } }) => {
				const idData = await lastIds.get();
				const newThreads = idData
					? threadsData.filter(({ last_post_id: lastPostId }) => lastPostId > idData.lastPostId)
					: threadsData;

				if (!newThreads.length) return;

				const links = await getLinks({ type: $Enums.LinkType.THREAD });
				const threadsToNotify = newThreads.filter((thread) => links.some(({ id }) => thread.thread_id === id));

				if (threadsToNotify.length) {
					const postsToNotify = await Promise.all(
						...threadsToNotify.map((thread) => {
							const lastPage = Math.ceil(thread.reply_count / 20);
							const previousLastPage = links.find(({ id }) => id === thread.thread_id).lastPage ?? lastPage;

							return Array.from({ length: lastPage - previousLastPage + 1 }, (_, index) => {
								const page = previousLastPage + index;
								return apiInstance
									.get(`/threads/${thread.thread_id}/posts`, { params: { page } })
									.then(({ data }) =>
										data.posts.filter(
											({ post_id, message_state, user_id }) =>
												post_id > (idData?.lastPostId ?? 0) && message_state === "visible" && user_id !== +process.env.FORUM_USER_ID,
										),
									);
							});
						}),
					).then((response) => response.flat());
					const client = this.client;

					await Promise.all([
						...postsToNotify.flatMap((post) =>
							links
								.filter(({ id }) => post.thread_id === id)
								.flatMap(({ subscriptions }) =>
									subscriptions.map((subscription) => {
										const thread = threadsData.find(({ thread_id }) => thread_id === subscription.linkId);
										const container = new ContainerBuilder()
											.setAccentColor(0xffffff)
											.addTextDisplayComponents({
												content: heading(
													`В теме ${bold(hyperlink(thread.title, thread.view_url))} ` +
														`новое ${bold(hyperlink("сообщение", post.view_url))}!`,
												),
											})
											.addSeparatorComponents(new SeparatorBuilder());

										if (post.User.avatar_urls.l)
											container.addSectionComponents(
												new SectionBuilder()
													.setThumbnailAccessory(
														new ThumbnailBuilder({
															media: { url: post.User.avatar_urls.l },
															description: "Аватар автора",
														}),
													)
													.addTextDisplayComponents(
														new TextDisplayBuilder({ content: bbToMarkdown(post.message, 1e3) }),
													),
											);
										else container.addTextDisplayComponents({ content: bbToMarkdown(post.message, 1e3) });

										container.addSeparatorComponents(new SeparatorBuilder()).addTextDisplayComponents({
											content: `Автор: ${bold(hyperlink(post.User.username, post.User.view_url))}`,
										});

										if (subscription.guildId && subscription.moderatorRolesIds?.length)
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
															customId: `moderate:${subscription.id}:${post.post_id}`,
															emoji: "✍️",
															style: ButtonStyle.Success,
															label: "Обработать",
														}),
													],
												}),
											);

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
									}),
								),
						),
					]);
				}

				return lastIds.update({ lastPostId: threadsData[0].last_post_id });
			})
			.catch(console.error);
	},
	null,
	null,
	null,
	/** @type {{ client: Client }} */ ({ client: undefined }),
);
