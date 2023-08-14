const client = require('../../client/bot');

const getMember = async (memberId, guildId) => {
    try {
        const guild = client.guilds.cache.get(guildId);
        const member = guild.members.cache.get(memberId);
        return member;
    } catch (error) {
        console.error(error);
    }
}

module.exports = { getMember };