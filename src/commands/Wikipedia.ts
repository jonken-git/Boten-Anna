import { Command } from "../Command";
import { Client, CommandInteraction, ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { fetch } from 'cross-fetch';
import { parseArgs } from "../helpers/ParseArgs";


export const Wikipedia: Command = {
  name: "wikipedia",
  description: "Search for Wikipedia article",
  options: [
    {
      name: 'query',
      description: 'The searchd article.',
      required: true,
      type: ApplicationCommandOptionType.String
    }
  ],
  type: ApplicationCommandType.ChatInput,
  run: async (_client: Client, interaction: CommandInteraction) => {
    const args = parseArgs(interaction.options.data);
    const res = fecthArticles(args.get('query'));
    console.log(res);
    // make API call...

    const embed = new EmbedBuilder()
      .setTitle(`Showing results x-y for query`);

    const nextButton = new ButtonBuilder()
      .setCustomId('next')
      .setLabel('Next page')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(nextButton);

    await interaction.followUp({
      ephemeral: false,
      embeds: [embed],
      components: [row]
    });
  }
};

const fecthArticles = (query: string) => {
  return query;
}