require("dotenv/config");
const path = require("path");

const { defineConfig } = require("prisma/config");

module.exports = defineConfig({
	schema: path.join("prisma", "schema"),
	migrations: {
		seed: "node seed.js",
	},
	datasource: {
		url: process.env.DATABASE_URL,
		shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
	},
});
