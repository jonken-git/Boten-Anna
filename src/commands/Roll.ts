import { Command } from "src/Command";
import { ApplicationCommandOptionType, ApplicationCommandType, Client, CommandInteraction, GuildMember } from 'discord.js';
import { parseArgs } from "../helpers/ParseArgs";
import { getNicknameOrUsernameFromInteraction } from "../helpers/GetGuildUser";


export const Roll: Command = {
	name: 'roll',
	description: 'Roll a number between 1 and 100.',
	type: ApplicationCommandType.ChatInput,
	options: [
		{
			name: 'span',
			description: 'Span for the roll, e.g. 50-900 or just 900',
			required: false,
			type: ApplicationCommandOptionType.String
		}
	],
	run: async (client: Client, interaction: CommandInteraction) => {
		const args: Map<string, string> | undefined = parseArgs(interaction.options.data);
		let min: number = 1;
		let max: number = 100;

		if (args !== undefined) {
			const span: string = args.get('span')!;
			const minMaxRe: RegExp = new RegExp(/[0-9]+-[0-9]+/);
			const maxRe: RegExp = new RegExp(/[0-9]+/);
			if (minMaxRe.test(span)) {
				const minAndMax: Array<number> = span.split('-').map(val => parseInt(val.replace(/\D/g, '')));
				min = Math.min(...minAndMax);
				max = Math.max(...minAndMax);
			} else if(maxRe.test(span)) {
				max = parseInt(span.replace(/\D/g, ''));
			}
		}
		const result: number = Math.round(Math.random() * (max - min)) + min;
		const username: string = await getNicknameOrUsernameFromInteraction (client, interaction) ?? 'Member';

		let content: string = '';
		if (result === 42) {
			content = `So long, and thanks for all the fish! :dolphin:`
		} else if (result === 69) {
			content = `That's the sex number :Fingerguns:`;
		} else if (result === 420) {
			content = `Weed duuuuude`;
		} else if (result === 1337) {
			content = `Kan du dansa? /dance Ja, tydligen.`;
		} else {
			content = `${username ?? 'Member'} rolls ${result} (${min}-${max})`
		}
		await interaction.followUp({
			ephemeral: true,
			content: content
		});
	}

}