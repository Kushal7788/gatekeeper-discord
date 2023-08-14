const { GuildConfig } = require('../../models/guild-config.js');
const { clearQRImages } = require("./clear-qr");
const { UserConfig } = require('../../models/user-config');
const client = require('../../client/bot');
const { sendReclaimUrl } = require('./send-reclaim-url');

const checkMember = async (member, guild, role) => {
    try {
        let userConfig = await UserConfig.findOne({ guildMemberId: guild.id + member.user.id });
        const isVerified = member.roles.cache.has(role.id);
        const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
        if (!userConfig) {
            userConfig = new UserConfig({
                guildMemberId: guild.id + member.user.id,
                data: {
                    isVerified: isVerified,
                    startTime: Date.now(),
                    username: member.user.username
                }
            });
            await userConfig.save();
        }
        if (isVerified) return;
        return await sendReclaimUrl(member, guild, guildConfig.data.provider);
    } catch (err) {
        console.log(`err: ${err}`);
    }
};


const iterateMembers = async (guild) => {
    try {
        const guildConfig = await GuildConfig.findOne({ guildId: guild.id });
        if (guildConfig && (Date.now() - guildConfig.data.scheduledStartTime > (guildConfig.data.scheduledTimer - 30000))) {
            guildConfig.data = {
                ...guildConfig.data,
                scheduledStartTime: Date.now()
            };
            await guildConfig.save();
            console.log(`Iterating members in ${guild.name}...`);
            const members = await guild.members.fetch();
            const verifyRole = guild.roles.cache.find(role => role.name === guildConfig.data.verificationRole);
            const rolesToExclude = guildConfig.data.exemptRoles;
            for (const member of members.values()) {
                let hasExcludedRole = false;
                if (rolesToExclude && rolesToExclude.length > 0) {
                    hasExcludedRole = member.roles.cache.some(role => rolesToExclude.includes(role.id));
                }
                if (hasExcludedRole) continue;
                await checkMember(member, guild, verifyRole);
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

const scheduler = async () => {
    try {
        console.log('Checking for unverified users in all guilds...');
        await clearQRImages();
        await iterateGuilds(client.guilds.cache);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

module.exports = scheduler;