const { Events } = require("discord.js");

const Event = require("../classes/Event");
const { loadCommands } = require("../utils");

module.exports = new Event({
	name: Events.ClientReady,
	once: true,
	listener(bot, botInfo) {
		console.log(`Приложение было авторизовано как: «${bot.user.tag}».`);

		botInfo.schedules.forEach((schedule) => {
			schedule.context.client = bot;
			schedule.context.botInfo = botInfo;
			schedule.start();
		});

		bot.application.emojis
			.fetch()
			.then(() => console.log("Получение данных эмодзи окончено"))
			.catch((error) => {
				console.error(error);
				console.log("При получении данных эмодзи произошла ошибка");
			});

		loadCommands(bot, botInfo)
			.then(() => console.log("Обновление команд окончено"))
			.catch((err) => {
				console.error(err);
				console.log("При обновлении команд произошла ошибка");
			});
	},
});
