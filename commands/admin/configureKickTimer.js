const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../models/guild-config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick-scheduler')
        .setDescription('No of days of being in unverified state before auto kick.')
        .addIntegerOption(option =>
            option
                .setName('kick-timer')
                .setDescription('Enter No of days.')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: 'You do not have the permission to run this command.', ephemeral: true });
        }

        const kickTimer = interaction.options.getInteger('kick-timer') * 60 * 60 * 6 * 1000;
        
        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (guildConfig) {
            if(!guildConfig.data.kickPeople){
                return await interaction.reply({ content: 'Please enable kick feature before setting kick timer.', ephemeral: true });
            }
            if (kickTimer<=0) {
                return await interaction.reply({ content: 'Please enter the valid kick timer.', ephemeral: true });
            }
            if(guildConfig.data.scheduledTimer >= kickTimer){
                return await interaction.reply({ content: 'Kick timer should be more than scheduled timer.', ephemeral: true });
            }
            guildConfig.data = {
                ...guildConfig.data,
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