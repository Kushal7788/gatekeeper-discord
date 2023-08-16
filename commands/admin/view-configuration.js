const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../models/guild-config.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('view-configuration')
        .setDescription('View the current configuration of the bot.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: 'You do not have the permission to run this command.', ephemeral: true });
        }
        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!guildConfig) {
            return await interaction.reply({ content: 'Please configure the bot first.', ephemeral: true });
        }
        let exemptRoleNames = '';
        if (guildConfig.data.exemptRoles) {
            for (const roleID of guildConfig.data.exemptRoles) {
                const role = await interaction.guild.roles.fetch(roleID);
                exemptRoleNames += `${role.name}, `;
            }
        }
        const kickPeople = guildConfig.data.kickPeople ? 'Enabled' : 'Disabled';
        const kickTimer = guildConfig.data.kickTimer ? `${guildConfig.data.kickTimer / (1000 * 60 * 60)} hours` : 'None';
        const verificationRole = guildConfig.data.verificationRole ? `${guildConfig.data.verificationRole}` : 'None';
        const provider = guildConfig.data.provider ? guildConfig.data.provider : 'None';
        const condition = guildConfig.data.condition ? guildConfig.data.condition : 'None';
        const value = guildConfig.data.value ? guildConfig.data.value : 'None';
        const scheduledTimer = guildConfig.data.scheduledTimer ? `${guildConfig.data.scheduledTimer / (1000 * 60 * 60)} hours` : 'None';


        const embed = {
            color: 0x0099ff,
            title: 'Current Configuration',
            description: 'This is the current configuration of the GateKeeper bot.',
            fields: [
                { 
                    name: '\u200B', 
                    value: '\u200B' 
                },
                {
                    name: 'Exempted Roles',
                    value: exemptRoleNames
                },
                {
                    name: '\u00A0',
                    value: '\u00A0'
                },
                {
                    name: 'Provider',
                    value: provider,
                    inline: true
                },
                {
                    name: 'Condition',
                    value: condition,
                    inline: true
                },
                {
                    name: 'Value',
                    value: value,
                    inline: true
                },
                {
                    name: '\u00A0',
                    value: '\u00A0'
                },
                {
                    name: 'verification Role',
                    value: verificationRole
                },
                {
                    name: '\u00A0',
                    value: '\u00A0'
                },
                {
                    name: 'Kick People',
                    value: kickPeople
                },
                {
                    name: '\u00A0',
                    value: '\u00A0'
                },
                {
                    name: 'Kick Scheduler',
                    value: kickTimer,
                    inline: true
                },
                {
                    name: 'Verification Scheduler',
                    value: scheduledTimer,
                    inline: true
                }
            ]

        };
        return await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};


