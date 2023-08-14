const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../models/guild-config.js');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('exempt-roles')
        .setDescription('Exempt roles from being kicked.')
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('Select the role to exempt.')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: 'You do not have the permission to run this command.', ephemeral: true });
        }

        const role = interaction.options.getRole('role');
        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (!guildConfig) {
            return await interaction.reply({ content: 'Please configure the bot first.', ephemeral: true });
        }

        if (guildConfig.data.exemptRoles && guildConfig.data.exemptRoles.includes(role.id)) {
            return await interaction.reply({ content: 'This role is already exempted.', ephemeral: true });
        }

        if (!guildConfig.data.exemptRoles) {
            guildConfig.data = {
                ...guildConfig.data,
                exemptRoles: [role.id]
            };
        }
        else {
            guildConfig.data = {
                ...guildConfig.data,
                exemptRoles: [...guildConfig.data.exemptRoles, role.id]
            };
        }
        await guildConfig.save();
        await interaction.reply({ content: 'Role exempted successfully.', ephemeral: true });
    }
};


