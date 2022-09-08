import { Command } from "../Command";
import { CommandInteraction, Client, ApplicationCommandType, GuildMember, Guild } from "discord.js";

export const Hello: Command = {
  name: "hello",
  description: "Returns a greeting",
  type: ApplicationCommandType.ChatInput,
  run: async (client: Client, interaction: CommandInteraction) => {
    const username: string = interaction.user.username;

    await interaction.followUp({
      ephemeral: true,
      content: `Herro ${username}`
    });
  }
};