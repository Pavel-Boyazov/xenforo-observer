const Autocomplete = require("../../../../../classes/Autocomplete");
const { getLinks } = require("../../../../../mfunc");
const { $Enums } = require("../../../../../prisma/generated");
const { apiInstance } = require("../../../../../utils");

module.exports = new Autocomplete({
	optionName: "ссылка",
	getRespond(interaction) {
		return getLinks({ subscriptions: { some: { targetId: interaction.user.id } } }).then((links) =>
			Promise.all(
				links.map(async ({ type, id }) => {
					let path;

					switch (type) {
						case $Enums.LinkType.FORUM:
							path = `/forums/${id}`;
							break;
						case $Enums.LinkType.THREAD:
							path = `/threads/${id}`;
							break;
					}

					let title;

					try {
						await apiInstance.get(path).then(({ data }) => {
							switch (type) {
								case $Enums.LinkType.FORUM:
									title = data.forum.title;
									break;
								case $Enums.LinkType.THREAD:
									title = data.thread.title;
									break;
							}
						});
					} catch (error) {
						if (error.status !== 403 && error.status !== 404) console.error(error);
					}

					return {
						name: `https://forum.arzguard.com${path}${title ? ` (${title})` : ""}`,
						value: `https://forum.arzguard.com${path}`,
					};
				}),
			),
		);
	},
});
