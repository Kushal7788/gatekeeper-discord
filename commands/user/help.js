const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const client = require('../../client/bot');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays the list of available commands.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Displays the list of available user commands.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('admin')
                .setDescription('Displays the list of available admin commands.')
        ),
    async execute(interaction) {
        const command = interaction.options.getSubcommand();
        if (command == 'user') {
            const userCommands = {
                'space': {
                    name: '\u200B',
                    description: '\u200B'
                },
                'help user': {
                    name: '/help user',
                    description: 'Displays the list of available commands.'
                },
                'gap': {

                    name: '\u00A0',
                    description: '\u00A0'
                },
                'verify-me': {
                    name: '/verify-me',
                    description: 'Verifies the user.'
                },
                'gap': {

                    name: '\u00A0',
                    description: '\u00A0'
                },
            }
            const userCommandsEmbed = {
                color: 0x0099ff,
                title: 'User Commands',
                description: 'List of available user commands.\n',
                fields: Object.values(userCommands).map(command => {
                    return {
                        name: command.name,
                        value: command.description
                    }
                }),
                timestamp: new Date(),
            };
            return await interaction.reply({ embeds: [userCommandsEmbed], ephemeral: true });
        }
        else if (command == 'admin') {
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return await interaction.reply({ content: 'You do not have the permission to run this command.', ephemeral: true });
            }
            const adminCommands = {
                'space': {
                    name: '\u200B',
                    description: '\u200B'
                },
                'help admin': {
                    name: '/help admin',
                    description: 'Displays the list of available commands.'
                },
                'gap': {

                    name: '\u00A0',
                    description: '\u00A0'
                },
                'configure': {
                    name: '/configure',
                    description: 'Configures the bot.'
                },
                'gap': {

                    name: '\u00A0',
                    description: '\u00A0'
                },
                'kick-unverified': {
                    name: '/kick-unverified',
                    description: 'Auto kick feature on failure of verification. Disbaled by default'
                },
                'gap': {

                    name: '\u00A0',
                    description: '\u00A0'
                },
                'kick-scheduler': {
                    name: '/kick-scheduler',
                    description: 'No of days of being in unverified state before auto kick.'
                },
                'gap': {

                    name: '\u00A0',
                    description: '\u00A0'
                },
                'exempt-role': {
                    name: '/exempt-role',
                    description: 'Exempts the role from verification.'
                },
                'gap': {

                    name: '\u00A0',
                    description: '\u00A0'
                },
                'view-configuration': {
                    name: '/view-configuration',
                    description: 'Displays the current bot configuration.'
                },
                'gap': {

                    name: '\u00A0',
                    description: '\u00A0'
                },
            }
            const adminCommandsEmbed = {
                color: 0x0099ff,
                title: 'Admin Commands',
                description: 'List of available admin commands.\n',
                fields: Object.values(adminCommands).map(command => {
                    return {
                        name: command.name,
                        value: command.description
                    }
                }
                ),
                timestamp: new Date(),
            };
            return await interaction.reply({ embeds: [adminCommandsEmbed], ephemeral: true });

        }
    },
};