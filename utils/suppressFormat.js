/**
 * @template {string | undefined | null} T
 * Убрать форматирование для отправки в discord
 * @param {T} string Какой-либо текст
 * @param {object} options Настройки форматирования
 * @param {boolean} [options.code = false] Тип форматирования - код?
 * @param {boolean} [options.mentions = false] Оставлять упоминания?
 * @returns {T}
 */
module.exports = function suppressFormat(string, { code = false, mentions = false } = {}) {
	if (!string) return string;
	return string.replaceAll(/[#(\-`_*|>~]/gm, (formatSymbol, index) => {
		if (code) return formatSymbol === "`" ? "’" : formatSymbol;
		else if (mentions && (formatSymbol === ">" || formatSymbol === "#"))
			return /<(@[!&]?|#)(\d{17,19})>/g.test(
				string.slice(string.lastIndexOf("<", index), string.indexOf(">", index) + 1),
			)
				? formatSymbol
				: `\\${formatSymbol}`;
		return `\\${formatSymbol}`;
	});
};
