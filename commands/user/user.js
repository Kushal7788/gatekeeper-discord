const { SlashCommandBuilder } = require('discord.js');
const { getReclaimUrlFunction } = require('../../reclaim/utils/get-reclaim');
const QRCode = require('qrcode');
const { UserConfig } = require('../../models/user-config');
const { GuildConfig } = require('../../models/guild-config.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('verify-me')
		.setDescription('Sends verification link to the user to verify their account.'),
	async execute(interaction) {
		const guildConfig = await GuildConfig.findOne({ guildId: interaction.guild.id });
		if(!guildConfig)
		{
			return await interaction.reply({content: 'Please ask the Admin to setup the Scam Checker Bot before running this command', ephemeral: true});
		}

		const userConfig = await UserConfig.findOne({guildMemberId: interaction.guild.id + interaction.member.user.id})

		if(!userConfig)
		{
			return await interaction.reply({content: 'User not found!', ephemeral: true})
			
		}
		if(userConfig.data.isVerified)
		{
			return await interaction.reply({content: 'You are already verified!', ephemeral: true})
			
		}

		try {
			const url = await getReclaimUrlFunction(interaction.member, interaction.guild.id, guildConfig.data.provider);
			if (!url || url === '') {
				console.log(`Could not create reclaim url for ${interaction.member.user.username}.`);
			} else {
				console.log(`Sending a QR code message to ${interaction.member.user.username}.`)
				QRCode.toFile(`qrimages/${interaction.member.user.id}.png`, url, async (err) => {
					if (err) {
						console.log('FATAL:', err);
					}
					return await interaction.reply({
						content: `Hello, "${interaction.member.user.username}!" You are not verified in the "${interaction.guild.name}". Please verify soon to avoid being kicked out of the server\n\nUrl for verification: ${url}`,
						files: [{ attachment: `qrimages/${interaction.member.user.id}.png` }],
						ephemeral: true
					})
				});
			}
		} catch (error) {
			console.error(error);
			return await interaction.reply({content: 'Something went wrong!', ephemeral: true})
		}
	},
};
