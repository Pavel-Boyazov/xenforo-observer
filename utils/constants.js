const { PrismaMariaDb } = require("@prisma/adapter-mariadb");
const { default: axios } = require("axios");

const { PrismaClient } = require("../prisma/generated");

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);

module.exports = {
	prisma: new PrismaClient({ adapter }),
	apiInstance: axios.create({
		baseURL: `https://${process.env.FORUM_HOSTNAME}/api/`,
		headers: {
			"XF-Api-Key": process.env.FORUM_API_TOKEN,
		},
	}),
	rssInstance: axios.create({ baseURL: `https://${process.env.FORUM_HOSTNAME}/` }),
	urlRegex: /\/(?<type>forums|threads)\/(?<id>\d+)\/?(?:page-\d+)?(?:#post-)?(?<post_id>\d+)?/,
	botColors: {
		green: 0x85ea8a,
		yellow: 0xffca59,
		red: 0xff686b,
		blue: 0x27f4ff,
		gold: 0xffd700,
		purple: 0x9452fb,
	},
};
