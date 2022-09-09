import { Command } from "../Command";
import { EmptyNewLine } from "../helpers/emptyEmbedField";
import { CommandInteraction, Client, ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType, CommandInteractionOption, CacheType } from "discord.js";
import { fetch } from 'cross-fetch';
import * as dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.WEATHER_TOKEN;

interface embedField {
  name: string,
  value: string,
  inline?: boolean
}

const getDayName = (date: string): string => new Date(date).toLocaleDateString('en-US', { weekday: 'long'});
const getUrl = (location: string): string => `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&key=${API_KEY}&contentType=json`;

export const Weather: Command = {
  name: "weather",
  description: "Returns the weather of a specified location.",
  options: [
    {
      name: 'location',
      description: 'The location.',
      required: true,
      type: ApplicationCommandOptionType.String
    },
    {
      name: 'span',
      description: 'The number of days to display (max 5)',
      required: false,
      type: ApplicationCommandOptionType.Number
    }
  ],
  type: ApplicationCommandType.ChatInput,
  run: async (_client: Client, interaction: CommandInteraction) => {
    const args: readonly CommandInteractionOption<CacheType>[] = interaction.options.data;
    const queryLocation: string = args.find(arg => arg.name === 'location')?.value?.toString()!;
    const span: number | undefined = Number(args.find(arg => arg.name === 'span')?.value);
    const embed = await fetchWeather(queryLocation, span);

    await interaction.followUp({
      ephemeral: false,
      embeds: [embed]
    });
  }
};

const fetchWeather = async (queryLocation: string, span?: Number) => {
  const query: string = queryLocation.replace(' ', '%20');
  const url: string = getUrl(query);
  const res = await fetch(url);

  if (res.status !== 200) {
    return new EmbedBuilder()
      .setTitle('Not found')
      .addFields({ name: 'Error', value: `Nothing found for ${queryLocation}` })
  }

  const jsonData = await res.json();
  const curr = jsonData['currentConditions'];
  const dailyData = jsonData['days'];
  curr['max'] = dailyData[0]['tempmax'];
  curr['min'] = dailyData[0]['tempmin'];
  const isPreception = Boolean(curr['precipprob']);
  const precipValue = `${ isPreception ? (curr['precipprob'] != null ? curr['precipprop'] + '\n' + curr['precip'] + 'mm': '') : 'None'}`
  const embedFields: embedField[] = [
    { name: 'Current conditions', value: curr['conditions'], inline: false },
    { name: 'Temperature :sunglasses:', value: curr['temp'].toString() + '°C', inline: true },
    { name: 'Highest :hot_face:', value: curr['max'].toString() + '°C', inline: true },
    { name: 'Lowest :cold_face:', value: curr['min'].toString() + '°C', inline: true },
    { name: 'Precipation :cloud_rain:', value: precipValue, inline: true },
    { name: 'Sunrise :sunny:', value: curr['sunrise'], inline: true },
    { name: 'Sunset :crescent_moon:', value: curr['sunset'], inline: true }
  ];
  if (span) {
    const nrOfDays = Number(span);
    const upperLimit: number = 5;
    embedFields.push(EmptyNewLine);
    for (let i = 1; (i <= nrOfDays) && (i <= upperLimit); i++) {
      const { 
        datetime, 
        temp,
        tempmax, 
        tempmin 
      } = dailyData[i];

      embedFields.push(
        { name: getDayName(datetime), value: `${temp}°C`, inline: true },
        { name: 'Highest :hot_face:', value: `${tempmax}°C`, inline: true },
        { name: 'Lowest :cold_face:', value: `${tempmin}°C`, inline: true}
      );
    }
  }

  return new EmbedBuilder()
    .setTitle(jsonData['resolvedAddress'])
    .addFields(...embedFields)
    .setFooter({ text: `Showing result for: ${queryLocation}` })
    .setColor(0xF6BE00);
}