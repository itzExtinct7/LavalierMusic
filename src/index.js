import { Client, Events, GatewayIntentBits, MessageFlags } from "discord.js";
import { LavalinkManager } from "lavalink-client";
import { config } from "./config.js";
import { handleMusicButton } from "./handlers/buttonHandler.js";
import { loadCommands, registerCommands } from "./handlers/commandHandler.js";
import { registerLavalinkEvents } from "./handlers/lavalinkEvents.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.lavalink = new LavalinkManager({
  nodes: [
    {
      id: config.lavalink.id,
      host: config.lavalink.host,
      port: config.lavalink.port,
      authorization: config.lavalink.authorization,
      secure: config.lavalink.secure,
      retryAmount: config.lavalink.retryAmount,
      retryDelay: config.lavalink.retryDelay,
    },
  ],
  sendToShard: (guildId, payload) => {
    const guild = client.guilds.cache.get(guildId);
    if (guild) guild.shard.send(payload);
  },
  autoSkip: true,
  client: {
    id: config.discord.clientId,
    username: "LavalinkMusicBot",
  },
  playerOptions: {
    defaultSearchPlatform: config.player.defaultSearchSource,
    onEmptyQueue: {
      destroyAfterMs: config.player.emptyDisconnectMs,
    },
    onDisconnect: {
      autoReconnect: true,
      destroyPlayer: false,
    },
  },
  queueOptions: {
    maxPreviousTracks: 25,
  },
});

// Forward raw Discord voice state & voice server packets to Lavalink
client.on(Events.Raw, (data) => client.lavalink.sendRawData(data));

registerLavalinkEvents(client);

const commandsData = await loadCommands(client);

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`[Discord] Logged in as ${readyClient.user.tag}`);

  await client.lavalink.init({
    id: readyClient.user.id,
    username: readyClient.user.username,
  });

  try {
    await registerCommands(commandsData);
  } catch (err) {
    console.error("[Commands] Failed to register slash commands:", err);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isButton() && interaction.customId.startsWith("music_")) {
      return await handleMusicButton(interaction);
    }

    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    await command.execute(interaction);
  } catch (err) {
    console.error("[Interaction] Error:", err);
    const errorReply = {
      content: "Something went wrong while running that action.",
      flags: MessageFlags.Ephemeral,
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorReply).catch(() => {});
    } else {
      await interaction.reply(errorReply).catch(() => {});
    }
  }
});

if (!config.discord.token) {
  console.error("[Startup] DISCORD_TOKEN is missing in .env. Exiting.");
  process.exit(1);
}

await client.login(config.discord.token);
