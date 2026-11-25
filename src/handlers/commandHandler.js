import { Collection, REST, Routes } from "discord.js";
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { config } from "../config.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Dynamically loads all slash commands from src/commands/.
 */
export async function loadCommands(client) {
  client.commands = new Collection();
  const commandsData = [];
  const commandsRoot = join(__dirname, "..", "commands");

  for (const folder of readdirSync(commandsRoot)) {
    const folderPath = join(commandsRoot, folder);
    const files = readdirSync(folderPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const fileUrl = pathToFileURL(join(folderPath, file)).href;
      const mod = await import(fileUrl);
      const command = mod.default;

      if (command?.data && command?.execute) {
        client.commands.set(command.data.name, command);
        commandsData.push(command.data.toJSON());
      } else {
        console.warn(`[Commands] Skipped invalid command file: ${folder}/${file}`);
      }
    }
  }

  console.log(`[Commands] Loaded ${client.commands.size} slash commands.`);
  return commandsData;
}

/**
 * Registers slash commands to a specific guild (instant) or globally.
 */
export async function registerCommands(commandsData) {
  const rest = new REST({ version: "10" }).setToken(config.discord.token);

  if (config.discord.guildId) {
    await rest.put(
      Routes.applicationGuildCommands(config.discord.clientId, config.discord.guildId),
      { body: commandsData }
    );
    console.log(`[Commands] Registered ${commandsData.length} guild commands (${config.discord.guildId}).`);
  } else {
    await rest.put(Routes.applicationCommands(config.discord.clientId), {
      body: commandsData,
    });
    console.log(`[Commands] Registered ${commandsData.length} global commands.`);
  }
}
