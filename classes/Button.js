/**
 * @import { ButtonInteraction } from "discord.js"
 */

const BaseCustomIdInteractionExecutor = require("./BaseCustomIdInteractionExecutor");

/**
 * @template {ButtonInteraction} [Interaction=ButtonInteraction<"cached">]
 * @template {{ [name: string]: "string" | "number" | "boolean" }} [CustomIdPayloadTypes={ [name: string]: "string" | "number" | "boolean" }]
 * @augments BaseCustomIdInteractionExecutor<Interaction,CustomIdPayloadTypes>
 */
module.exports = class Button extends BaseCustomIdInteractionExecutor {};
