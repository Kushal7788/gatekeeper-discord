const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('../../models/guild-config.js');
const fs = require('fs');

// Read the JSON file and parse the data
const choicesData = JSON.parse(fs.readFileSync('./commands/admin/providers.json', 'utf8'));

// Create an array of choices based on the JSON data
const choices = choicesData.map(choice => ({ name: choice.name, value: choice.value }));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('configure')
        .setDescription('Configures the Rules for the verification role.')
        .addStringOption(option =>
            option
                .setName('provider')
                .setDescription('Select the provider type.')
                .setRequired(true)
                .addChoices(...choices)
        )
        .addStringOption(option =>
            option
                .setName('condition')
                .setDescription('Select the condition operator.')
                .setRequired(true)
                .addChoices(
                    { name: 'Equals', value: 'EQ' },
                    { name: 'Includes', value: 'INC' },
                    { name: 'Does not include', value: 'NINC' },
                    { name: 'Greater Than Equal To', value: 'GTE' },
                    { name: 'Less Than Equal To', value: 'LTE' },
                    { name: 'Greater Than', value: 'GT' },
                    { name: 'Less Than', value: 'LT' }
                )
        )
        .addStringOption(option =>
            option
                .setName('value')
                .setDescription('Enter the condition value.')
                .setRequired(true))
        .addStringOption(option =>
            option
                .setName('verification-role')
                .setDescription('Enter the verification role where the user will be added after verification.')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('verification-timer')
                .setDescription('Enter No. of days gap between each verification process')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return await interaction.reply({ content: 'You do not have the permission to run this command.', ephemeral: true });
        }

        const provider = interaction.options.getString('provider');
        const condition = interaction.options.getString('condition');
        const value = interaction.options.getString('value');
        const verificationRole = interaction.options.getString('verification-role');
        let scheduledTimer = interaction.options.getInteger('verification-timer');

        if (scheduledTimer) {
            scheduledTimer = scheduledTimer * 60 * 60 * 24 * 1000;
        } else {
            return await interaction.reply({ content: 'Please enter the valid verification timer.', ephemeral: true });
        }
        
        const role = interaction.guild.roles.cache.find(role => role.name === verificationRole);
        if (!role)
        {
            return await interaction.reply({ content: `There is no role named '${verificationRole}' in the server. Please add a valid role`, ephemeral: true });
        }

        const createObj = async () => {
            try {
                const exemptedRoleIds = [];
                const exemptRoles = ['Admin', 'Admins', 'ScamChecker'];
                for (const exemptRole of exemptRoles) {
                    const role = interaction.guild.roles.cache.find(role => role.name === exemptRole);
                    if (role) {
                        exemptedRoleIds.push(role.id);
                    }
                }
                const guildConfig = new GuildConfig();
                guildConfig.guildId = interaction.guild.id;
                guildConfig.data = {
                    provider: provider,
                    condition: condition,
                    value: value,
                    scheduledTimer: scheduledTimer,
                    verificationRole: verificationRole,
                    kickPeople: false,
                    kickTimer: 0,
                    scheduledStartTime: Date.now(),
                    exemptRoles: exemptedRoleIds
                };
                await guildConfig.save();
            } catch (err) {
                console.log(`err: ${err}`);
            }
        };
        const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
        if (guildConfig) {
            guildConfig.data = {
                ...guildConfig.data,
                provider: provider,
                condition: condition,
                value: value,
                scheduledTimer: scheduledTimer,
                verificationRole: verificationRole,
                scheduledStartTime: Date.now()
            };
            await guildConfig.save();
            return await interaction.reply({ content: 'Configuration Updated!', ephemeral: true });
        }
        else {
            await createObj();
            return await interaction.reply({ content: 'Configuration Added!', ephemeral: true });
        }
    },
};