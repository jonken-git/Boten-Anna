import { Command } from "../Command";
import { CommandInteraction, ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, ActionRowBuilder } from "discord.js";
import { fetch } from 'cross-fetch';
import { parseArgs } from "../helpers/ParseArgs";

const DEFAULT_LANG = 'en';
const DEFUALT_LIMIT = 3;
const DEFAULT_MAX = 10;

const numberEmojis: string[] = [':one:',
  ':two:',
  ':three:',
  ':four:',
  ':five:',
  ':six:',
  ':seven:',
  ':eight:',
  ':nine:',
  ':keycap_ten:',
];

const getUrl = (query: string, language: string, limit: number): string => {
  const max = limit <= DEFAULT_MAX ? limit : DEFAULT_MAX
  return `https://${language}.wikipedia.org/w/api.php?&origin=*&action=opensearch&search=${query}&limit=${max}`;
}

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
      description: 'The search query.',
      required: true,
      type: ApplicationCommandOptionType.String
    },
    {
      name: 'language',
      description: 'Language of the articles. (sv, en, etc.)',
      required: false,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: 'limit',
      description: `Articles to display (default ${DEFUALT_LIMIT}, max ${DEFAULT_MAX})`,
      required: false,
      type: ApplicationCommandOptionType.Number,
    }
  ],
  type: ApplicationCommandType.ChatInput,
  run: async (_, interaction: CommandInteraction) => {
    const args: Map<string, any> = parseArgs(interaction.options.data);
    const query: string = args.get('query');
    const language: string = args.get('language') ?? DEFAULT_LANG;
    const limit: number = args.get('limit') ?? DEFUALT_LIMIT;

    const content = await fetchArticles(query, language, limit);
    const count: number = content.get('count');
    const text: string = content.get('content');

    const embed = new EmbedBuilder()
      .setTitle(`Found ${count} article${count !== 1 ? 's' : ''}`)
      .addFields({ name: 'Results', value: text })
      .setFooter({ text: `Showing results for '${query}'` })
      .setColor(0xC0C0C0);

    await interaction.followUp({
      ephemeral: false,
      embeds: [embed]
    });
  }
};

const fetchArticles = async (query: string, language: string, limit: number): Promise<Map<string, any>> => {
  const url = getUrl(query, language, limit);
  const res = await fetch(url);
  const jsonData = await res.json();
  const data = new Map<string, string | number>();

  // article names : jsonData[1],
  // article URL : jsonData[3], they are always same size
  if (jsonData[1].length === 0) {
    data.set('count', jsonData[1].length);
    data.set('content', 'Nothing found...');
    return data;
  }

  const articles: Article[] = [];
  for (let i = 0; i < jsonData[1].length; i++) {
    articles.push({
      title: jsonData[1][i],
      url: jsonData[3][i],
    });
  }

  const articleLinks: string[] = articles.map((article: Article, i: number) => {
    return `${numberEmojis[i]} [${article.title}](${article.url})`;
  });
  const textContent: string = articleLinks.join('\n\n');
  data.set('count', articles.length);
  data.set('content', textContent);
  return data;
}
