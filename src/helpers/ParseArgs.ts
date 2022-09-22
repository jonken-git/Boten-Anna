import { CacheType, CommandInteractionOption } from "discord.js";

/**
 * 
 * @param args Array contaning the commands.
 * @returns Map<string, any> containing all the supplied agrument names as keys.
 */
export const parseArgs = (args: readonly CommandInteractionOption<CacheType>[]): Map<string, any> => {
  const argsMap = new Map<string, any>();
  for (let { name, value } of args) {
    argsMap.set(name, value);
  }
  return argsMap;
}