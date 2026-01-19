/**
 * @import { Snowflake } from "discord.js"
 *
 * @import { Prisma } from "./prisma/generated"
 */

const { prisma } = require("./utils");

module.exports = {
	/**
	 * @param {Prisma.ObservedLinkWhereInput} where Фильтр ссылок
	 */
	getLinks: (where) => prisma.observedLink.findMany({ where, include: { subscriptions: true } }),
	/**
	 * @param {Snowflake} guildId Discord ID сервера
	 * @param {number} forumId ID форума для проверки
	 */
	checkAccess: (guildId, forumId) =>
		prisma.accessOverwrite.findUnique({ where: { guildId, allowedForumsIds: { array_contains: forumId } } }),
};

module.exports.subscriptions = {
	/**
	 * @param {Prisma.XOR<Prisma.SubscriptionCreateInput, Prisma.SubscriptionUncheckedCreateInput>} data Данные подписки
	 */
	create: (data) => prisma.subscription.create({ data }),
	/**
	 * @param {Prisma.SubscriptionWhereUniqueInput} where Уникальные данные подписки
	 */
	delete: (where) => prisma.subscription.delete({ where }),
	/**
	 * @param {number} id ID подписки
	 * @param {Prisma.SubscriptionUpdateInput} data Данные для обновления
	 */
	update: (id, data) => prisma.subscription.update({ where: { id }, data, include: { link: true } }),
	get: (id) => prisma.subscription.findUnique({ where: { id } }),
};

module.exports.lastIds = {
	get: () => prisma.idData.findFirst(),
	create: () => prisma.idData.upsert({ where: { id: 0 }, update: {}, create: { id: 0 } }),
	/** @param {Prisma.IdDataUpdateInput} data Новые данные */
	update: (data) => prisma.idData.update({ where: { id: 0 }, data }),
};
