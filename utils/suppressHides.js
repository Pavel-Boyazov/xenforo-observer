/**
 * @import { NodeContent } from "@bbob/types"
 */

const { default: parse } = require("@bbob/core");

const suppressFormat = require("./suppressFormat");

/**
 * @param {NodeContent} node Элемент
 * @param {number} index Индекс
 * @param {NodeContent[]} tree Древо элементов
 */
function nodeFilter(node, index, tree) {
	const filterTags = ["groups", "users"];

	return (
		!filterTags.includes(node.tag?.toLowerCase()) &&
		(node !== "\n" || tree[index + 2] !== "\n" || !filterTags.includes(tree[index + 1]?.tag?.toLowerCase()))
	);
}

/**
 * @param {string} string Строка для парса
 */
module.exports = function suppressHides(string) {
	return parse()
		.process(suppressFormat(string))
		.tree.filter(nodeFilter)
		.map((ast) => {
			/**
			 * @param {NodeContent} node Элемент
			 */
			function process(node) {
				if (typeof node === "string") return node;
				else if (Array.isArray(node)) return node.filter(nodeFilter).map(process).join("");
				else return node.toString();
			}

			return process(ast);
		})
		.join("");
};
