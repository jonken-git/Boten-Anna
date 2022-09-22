import { Command } from "../Command";
import { Client, CommandInteraction, ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { fetch } from 'cross-fetch';
import { parseArgs } from "../helpers/ParseArgs";

const getUrl = (query: string, language: string) => `https://${language}.wikipedia.org/w/api.php?&origin=*&action=opensearch&search=${query}&limit=5`;
interface Article { 
  title: string, 
  url: string 
};

export const Wikipedia: Command = {
  name: "wikipedia",
  description: "Search for Wikipedia article",
  options: [
    {
      name: 'query',
      description: 'The searched articles.',
      required: true,
      type: ApplicationCommandOptionType.String
    },
    {
      name: 'language',
      description: 'Language of the articles.',
      required: false,
      type: ApplicationCommandOptionType.String,
    }
  ],
  type: ApplicationCommandType.ChatInput,
  run: async (_, interaction: CommandInteraction) => {
    const args: Map<string, any> = parseArgs(interaction.options.data);
    const query: string = args.get('query');
    const language = args.get('language') ?? 'en';
    const url: string = getUrl(query, language);
    const res = await fetch(url);
    const jsonData: Array<any> = await res.json();
    let content = `Nothing found`;
    if (jsonData[1].length > 0) {
      const articles: Array<Article> = jsonData[1].map((val: string, i: number) => { return { title: val, url: jsonData[3][i] }});
      const numberEmojis: Array<string> = [':one:', ':two:', ':three:', ':four:', ':five:'];
      content = articles.map((article: Article, i: number) => `${numberEmojis[i]} [${article.title}](${article.url})`).join('\n\n');
    }

    const embed = new EmbedBuilder()
      .setTitle(`Found ${jsonData[1].length} article${jsonData[1].length == 1 ? '' : 's'}`)
      .addFields({ name: 'Results', value: content})
      .setFooter({ text: `Showing results for ${query}` })
      .setColor(0xC0C0C0);

    await interaction.followUp({
      ephemeral: false,
      embeds: [embed]
    });
  }
};

