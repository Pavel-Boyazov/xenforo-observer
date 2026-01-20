/**
 * @import { NodeContent } from "@bbob/types"
 */

const { default: parse } = require("@bbob/core");
const { italic, bold, strikethrough, hyperlink, quote } = require("discord.js");

const suppressFormat = require("./suppressFormat");

/**
 * @param {string} string Строка для парса
 * @param {number} [maxLength=500] Максимальная длина текста
 */
module.exports = function bbToMarkdown(string, maxLength = 1e3) {
	string = string.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

	let length = 0;
	let truncated = false;

	return parse()
		.process(suppressFormat(string))
		.tree.map((ast) => {
			/**
			 * @param {NodeContent} node Элемент
			 */
			function process(node) {
				if (truncated) return "";

				const remaining = maxLength - length;
				if (remaining <= 0) {
					truncated = true;
					return "";
				}

				if (typeof node === "string") {
					if (node.length <= remaining) {
						length += node.length;
						return node;
					} else {
						length = maxLength;
						truncated = true;
						return `${node.substring(0, remaining)}...`;
					}
				}
				if (Array.isArray(node)) {
					return node.map(process).join("");
				}

				const content = process(node.content);

				switch (node.tag.toLowerCase()) {
					case "media":
						return italic("[предпросмотр медиа недоступен]");

					case "spoiler":
					case "groups":
					case "users":
						return italic("[отображение скрытого контента недоступно]");

					case "b":
					case "strong":
						return bold(content);

					case "i":
					case "em":
						return italic(content);

					case "s":
					case "strike":
						return strikethrough(content);

					case "url":
					case "link": {
						const url = node.attrs[Object.keys(node.attrs)[0]];

						if (!url) return content;

						return hyperlink(content, url.slice(1, -1));
					}

					case "quote":
					case "blockquote":
						return content.trim().split("\n").map(quote).join("\n");

					case "code": {
						const lang = node.attrs.lang || "";
						return `\`\`\`${lang}\n${content}\n\`\`\``;
					}

					case "h1":
						return `# ${content}`;

					case "h2":
						return `## ${content}`;

					case "h3":
						return `### ${content}`;

					case "list": {
						const isOrdered = node.attrs["1"] || node.attrs.type === 1;
						const items = content.split("\n").filter((line) => line.trim() !== "");

						let markdownList = "";

						if (isOrdered) {
							items.forEach((item, index) => {
								markdownList += `${index + 1}. ${item.trim()}\n`;
							});
						} else {
							items.forEach((item) => {
								markdownList += `- ${item.trim()}\n`;
							});
						}

						return markdownList.trim();
					}

					case "ispoiler":
						return `||${content}||`;

					case "icode":
						return `\`${content}\``;

					default:
						return content;
				}
			}

			return process(ast);
		})
		.join("");
};
