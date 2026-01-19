const { PrismaClientKnownRequestError } = require("@prisma/client/runtime/client");
const { bold, hyperlink, MessageFlags } = require("discord.js");

const Button = require("../classes/Button");
const { unsubscribe } = require("../mfunc");
const { $Enums } = require("../prisma/generated");
const { apiInstance } = require("../utils");

module.exports = new Button({
	customId: "unsubscribe",
	customIdPayload: { subscriptionId: "number" },
	async execute(interaction, { subscriptionId }) {
		let linkType, linkId;

		try {
			({ linkType, linkId } = await unsubscribe({ id: subscriptionId }));
		} catch (err) {
			if (err instanceof PrismaClientKnownRequestError && err.code === "P2025")
				return interaction.reply({
					content: "Данная подписка уже отсутствует, вам не будут присылаться обновления",
					flags: MessageFlags.Ephemeral,
				});

			console.error(err);

			return interaction.reply({
				content: "К сожалению, не удалось отписаться от обновлений. Повторите попытку позже",
				flags: MessageFlags.Ephemeral,
			});
		}

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
		let path;

		try {
			switch (linkType) {
				case $Enums.LinkType.FORUM:
					path = `/forums/${linkId}`;
					await apiInstance.get(path).then(({ data }) => {
						title = data.forum.title;
					});
					break;
				case $Enums.LinkType.THREAD:
					path = `/threads/${linkId}`;
					await apiInstance.get(path).then(({ data }) => {
						title = data.thread.title;
					});
					break;
			}
		} catch (error) {
			if (error.status !== 403 && error.status !== 404) console.error(error);
		}

		const url = `https://${process.env.FORUM_HOSTNAME}${path}`;

		return interaction.reply({
			content: `Вы отписались от обновлений ${typeString} ` + bold(title ? hyperlink(title, url) : url),
			flags: MessageFlags.Ephemeral,
		});
	},
});
