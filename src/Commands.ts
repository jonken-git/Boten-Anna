import { Command } from "./Command";
import { Hello } from "./commands/Hello";
import { Weather } from "./commands/Weather";
import { Wikipedia } from "./commands/Wikipedia";
import { Roll } from "./commands/Roll";

export const Commands: Command[] = [
    Hello, 
    Weather, 
    Wikipedia,
    Roll
];