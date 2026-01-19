/**
 * @import { Snowflake } from "discord.js"
 *
 * @import { Prisma } from "./prisma/generated"
 */

const { prisma } = require("./utils");

module.exports = {
	/**
	 * @param {Prisma.XOR<Prisma.SubscriptionCreateInput, Prisma.SubscriptionUncheckedCreateInput>} data Данные подписки
	 */
	subscribe: (data) => prisma.subscription.create({ data }),
	/**
	 * @param {Prisma.SubscriptionWhereUniqueInput} where Уникальные данные подписки
	 */
	unsubscribe: (where) => prisma.subscription.delete({ where }),
	/**
	 * @param {number} id ID подписки
	 * @param {Prisma.SubscriptionUpdateInput} data Данные для обновления
	 */
	update: (id, data) => prisma.subscription.update({ where: { id }, data, include: { link: true } }),
	get: (id) => prisma.subscription.findUnique({ where: { id } }),
	/**
	 * @param {Prisma.ObservedLinkWhereInput} where Фильтр ссылок
	 */
	getLinks: (where) => prisma.observedLink.findMany({ where, include: { subscriptions: true } }),
};

module.exports.config = {
	/** Получить конфиги всех серверов
	 * @template {Prisma.MainConfigDefaultArgs} MainConfigArgs
	 * @param {MainConfigArgs?} args Аргументы для получения
	 * @returns {Prisma.PrismaPromise<Prisma.MainConfigGetPayload<MainConfigArgs>[]>} Конфиги серверов
	 */
	getServers: (args) => prisma.mainConfig.findMany({ ...args }),
	/** Получить конфигурацию
	 * @template {Prisma.MainConfigDefaultArgs} MainConfigArgs
	 * @param {Snowflake} guildId Discord ID сервера
	 * @param {MainConfigArgs?} args Аргументы для получения
	 * @returns {Promise<Prisma.MainConfigGetPayload<MainConfigArgs>>} Настройки сервера
	 */
	getConfig: (guildId, args) => prisma.mainConfig.findUnique({ where: { guildId }, ...args }),
};

module.exports.lastIds = {
	get: () => prisma.idData.findFirst(),
	create: () => prisma.idData.upsert({ where: { id: 0 }, update: {}, create: { id: 0 } }),
	/** @param {Prisma.IdDataUpdateInput} data Новые данные */
	update: (data) => prisma.idData.update({ where: { id: 0 }, data }),
};
