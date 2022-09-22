import { Client, GuildMember, CommandInteraction, Guild } from "discord.js";

export const getNicknameOrUsernameFromInteraction = async (client: Client, interaction: CommandInteraction): Promise<string> => {
	const guildId: string | null = interaction.guildId;
	if (guildId) {
		const guild: Guild = await client.guilds.fetch(guildId);
		const user: GuildMember = await guild.members.fetch(interaction.user.id);
		return user.nickname!;
	} else {
		return interaction.user.username;
	}
}