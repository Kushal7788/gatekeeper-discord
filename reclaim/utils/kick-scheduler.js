const { GuildConfig } = require('../../models/guild-config.js');
const { UserConfig } = require('../../models/user-config');
const client = require('../../client/bot');

const kickMembers = async (member, guild, verifyRole) => {
    try {
    const isVerified = member.roles.cache.has(verifyRole.id);
    const userConfig = await UserConfig.findOne({ guildMemberId: guild.id + member.user.id });
    const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
    if (userConfig && !isVerified && (Date.now() - userConfig.data.startTime > guildConfig.data.kickTimer)) {
        // Check if the user has the 'verificationRole' role
        console.log(`Kicking ${member.user.username}...`);
        await member.kick();
        await UserConfig.deleteOne({ guildMemberId: guild.id + member.user.id });
    }
    } catch (err) {
        console.log(`err: ${err}`);
    }
};

const iterateMembers = async (guild) => {
    try {
        console.log(`Kicking members in ${guild.name}...`);
        const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
        if (guildConfig && guildConfig.data.kickPeople) {
            const members = await guild.members.fetch();
            const verifyRole = guild.roles.cache.find(role => role.name === guildConfig.data.verificationRole);
            const rolesToExclude = guildConfig.data.exemptRoles;
            for (const member of members.values()) {
                let hasExcludedRole = false;
                if (rolesToExclude && rolesToExclude.length > 0) {
                    hasExcludedRole = member.roles.cache.some(role => rolesToExclude.includes(role.id));
                }
                if (hasExcludedRole) continue;
                await kickMembers(member, guild, verifyRole);
            }
        }
    } catch (err) {
        console.log(`err: ${err}`);
    }
};

const iterateGuilds = async (guilds) => {
    try {
        for (const guild of guilds.values()) {
            await iterateMembers(guild);
        }
    }
    catch (err) {
        console.log(`err: ${err}`);
    }
};

const kickScheduler = async () => {
    try {
        console.log('Kicking unverified users in all guilds...');
        await iterateGuilds(client.guilds.cache);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

module.exports = kickScheduler;