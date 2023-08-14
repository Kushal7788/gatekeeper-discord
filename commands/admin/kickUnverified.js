const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../models/guild-config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick-unverified')
        .setDescription('Auto kick feature on failure of verification. Disbaled by default')
        .addBooleanOption(option =>
            option
                .setName('enable-kick')
                .setDescription('Select the option.')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: 'You do not have the permission to run this command.', ephemeral: true });
        }

        const kickPeople = interaction.options.getBoolean('enable-kick');

        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
        const kickTimer = guildConfig.data.scheduledTimer + 1000000
        
        if (guildConfig) {
            guildConfig.data = {
                ...guildConfig.data,
                kickPeople: kickPeople,
                kickTimer: kickTimer,
                kickStartTime: Date.now()
            };
            await guildConfig.save();
            return await interaction.reply({ content: 'Configuration Updated!', ephemeral: true });
        }
        else {
            return await interaction.reply({ content: 'Please configure the bot before running this command', ephemeral: true });
        }
    },
};