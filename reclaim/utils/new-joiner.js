const client = require("../../client/bot");
const { UserConfig } = require('../../models/user-config');
const { GuildConfig } = require('../../models/guild-config.js');
const { sendReclaimUrl } = require('./send-reclaim-url');

const createNewUser = async (guildId, member, isVerified) => {
    try {
        const newUser = new UserConfig();
        newUser.guildMemberId = guildId + member.user.id;
        newUser.data = {
            isVerified: isVerified,
            startTime: Date.now(),
            username: member.user.username
        };
        await newUser.save();
        return;
    } catch (err) {
        console.log(`err: ${err}`);
    }
};

const newJoiner = async (member) => {
    // Send a welcome message to the user in the general channel
    console.log(`User ${member.user.username} has joined the server.`);
    const guild = member.guild;
    const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
    if (guildConfig) {
        const role = guild.roles.cache.find(role => role.name === guildConfig.data.verificationRole);
        const isVerified = member.roles.cache.has(role.id);
        createNewUser(guild.id, member, isVerified);
        if (isVerified) return;
        return await sendReclaimUrl(member, guild, guildConfig.data.provider);
    }
};

module.exports = { newJoiner };