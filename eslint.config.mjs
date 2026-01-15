import path from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import importPlugin from "eslint-plugin-import";
import jsdoc from "eslint-plugin-jsdoc";
import globals from "globals";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [
	{ ignores: ["prisma/generated/**"] },
	...compat.extends("eslint:recommended"),
	{
		plugins: {
			"import": importPlugin,
			jsdoc,
			"@stylistic": stylistic,
		},

		languageOptions: {
			globals: {
				...globals.node,
				NodeJS: true,
			},

			sourceType: "commonjs",
		},

		rules: {
			"import/order": [
				"error",
				{
					"newlines-between": "always",

					"alphabetize": {
						order: "asc",
					},
				},
			],

			"import/no-deprecated": "warn",
			"jsdoc/check-alignment": "warn",
			"jsdoc/check-property-names": "error",
			"jsdoc/check-syntax": "warn",
			"jsdoc/check-tag-names": "warn",
			"jsdoc/check-types": "warn",
			"jsdoc/check-values": "error",
			"jsdoc/empty-tags": "warn",
			"jsdoc/no-bad-blocks": "warn",
			"jsdoc/no-blank-block-descriptions": "warn",
			"jsdoc/no-blank-blocks": "warn",
			"jsdoc/no-multi-asterisks": "warn",
			"jsdoc/no-undefined-types": ["error", { markVariablesAsUsed: false }],
			"jsdoc/require-asterisk-prefix": "error",
			"jsdoc/require-hyphen-before-param-description": ["warn", "never"],
			"jsdoc/require-jsdoc": "warn",
			"jsdoc/require-param": "warn",
			"jsdoc/require-param-description": "warn",
			"jsdoc/require-param-name": "error",
			"jsdoc/require-param-type": "error",
			"jsdoc/require-property": "error",
			"jsdoc/require-property-description": "warn",
			"jsdoc/require-property-name": "error",
			"jsdoc/require-property-type": "error",
			"@stylistic/dot-location": ["error", "property"],
			"@stylistic/no-floating-decimal": "error",
			"@stylistic/no-multi-spaces": "error",
			"@stylistic/no-mixed-spaces-and-tabs": ["warn", "smart-tabs"],
			"@stylistic/array-bracket-spacing": "warn",
			"@stylistic/block-spacing": "warn",

			"@stylistic/brace-style": [
				"error",
				"1tbs",
				{
					allowSingleLine: true,
				},
			],

			"@stylistic/comma-dangle": ["error", "always-multiline"],
			"@stylistic/comma-spacing": "error",
			"@stylistic/comma-style": "error",
			"@stylistic/computed-property-spacing": "error",
			"@stylistic/eol-last": "error",
			"@stylistic/key-spacing": "error",
			"@stylistic/keyword-spacing": "error",

			"@stylistic/max-len": [
				"error",
				{
					code: 120,
					tabWidth: 2,
					ignoreComments: true,
					ignoreRegExpLiterals: true,
				},
			],

			"@stylistic/max-statements-per-line": "error",

			"@stylistic/no-multiple-empty-lines": [
				"error",
				{
					max: 1,
					maxBOF: 0,
				},
			],

			"@stylistic/function-call-spacing": "error",
			"@stylistic/no-trailing-spaces": "error",
			"@stylistic/no-whitespace-before-property": "error",
			"@stylistic/object-curly-spacing": ["error", "always"],
			"@stylistic/padded-blocks": ["error", "never"],
			"@stylistic/quote-props": ["error", "consistent-as-needed"],

			"@stylistic/quotes": [
				"error",
				"double",
				{
					avoidEscape: true,
				},
			],

			"@stylistic/semi-spacing": "error",
			"@stylistic/semi": "error",
			"@stylistic/space-before-blocks": "warn",

			"@stylistic/space-before-function-paren": [
				"warn",
				{
					anonymous: "never",
					named: "never",
					asyncArrow: "always",
				},
			],

			"@stylistic/space-in-parens": "warn",
			"@stylistic/space-infix-ops": "warn",
			"@stylistic/spaced-comment": "warn",
			"@stylistic/template-tag-spacing": "error",
			"@stylistic/arrow-spacing": "error",
			"@stylistic/rest-spread-spacing": "error",
			"@stylistic/template-curly-spacing": "error",
			"@stylistic/yield-star-spacing": "error",
			"no-mixed-spaces-and-tabs": "off",
			"no-unused-vars": "error",
			"no-await-in-loop": "error",
			"no-compare-neg-zero": "warn",
			"no-template-curly-in-string": "warn",
			"no-unsafe-negation": "error",
			"no-unsafe-finally": "off",
			"accessor-pairs": "error",
			"array-callback-return": "error",
			"no-empty-function": "warn",
			"no-implied-eval": "error",
			"no-invalid-this": "error",
			"no-lone-blocks": "error",
			"no-new-func": "error",
			"no-new-wrappers": "error",
			"no-new": "error",
			"no-octal-escape": "error",
			"no-return-assign": "error",
			"no-return-await": "error",
			"no-self-compare": "error",
			"no-sequences": "error",
			"no-throw-literal": "error",
			"no-unmodified-loop-condition": "error",
			"no-unused-expressions": "error",
			"no-useless-call": "error",
			"no-useless-concat": "warn",
			"no-useless-escape": "warn",
			"no-useless-return": "warn",
			"no-void": "error",
			"no-var": "error",
			"no-warning-comments": "warn",
			"prefer-promise-reject-errors": "error",

			"prefer-const": [
				"error",
				{
					destructuring: "all",
				},
			],

			"require-await": "error",
			"yoda": "error",
			"no-label-var": "error",
			"no-shadow": "error",
			"no-undef-init": "error",
			"getter-return": "error",
			"no-async-promise-executor": "error",

			"capitalized-comments": [
				"warn",
				"always",
				{
					ignorePattern: "prettier-ignore",
					ignoreConsecutiveComments: true,
				},
			],

			"func-names": "error",
			"func-name-matching": "error",

			"func-style": [
				"error",
				"declaration",
				{
					allowArrowFunctions: true,
				},
			],

			"max-depth": "error",

			"max-nested-callbacks": [
				"error",
				{
					max: 5,
				},
			],

			"new-cap": "error",
			"no-array-constructor": "error",
			"no-lonely-if": "warn",
			"no-object-constructor": "error",
			"no-unneeded-ternary": "warn",
			"operator-assignment": "error",
			"unicode-bom": "error",
			"arrow-body-style": "error",
			"no-duplicate-imports": "error",
			"no-useless-computed-key": "error",
			"no-useless-constructor": "error",
			"prefer-arrow-callback": "error",
			"prefer-numeric-literals": "error",
			"prefer-rest-params": "error",
			"prefer-spread": "error",
		},
	},
	{
		files: ["tests/**/*"],

		languageOptions: {
			globals: {
				...globals.jest,
			},
		},
	},
	{
		files: ["eslint.config.mjs"],

		languageOptions: {
			sourceType: "module",
		},
	},
];
