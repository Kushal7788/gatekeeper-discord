const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');
require('dotenv').config();

// Create a new client instance
const rest = new REST().setToken(process.env.TOKEN);
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages] });
client.commands = new Collection();
const commands = [];

// Loading command files
const foldersPath = path.join(__dirname, '../commands');
const commandFolders = fs.readdirSync(foldersPath);

// Adding all commands to client.commands
for (const folder of commandFolders) {
    console.log(`Loading commands from ${folder}...`);
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}

client.on('guildCreate', async (guild) => {
    console.log(`Joined a new guild: ${guild.name} (${guild.id})`);
    try {
        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENTID, guild.id),
            { body: commands },
        );

        console.log(`Successfully refreshed commands for guild ${guild.id}.`);
    } catch (error) {
        console.error(`Failed to refresh commands for guild ${guild.id}:`, error);
    }
});

client.login(process.env.TOKEN);


module.exports = client;