const client = require('../../client/bot');

const addRole = async (member, guildId, roleName) => {
    try {
        const guild = client.guilds.cache.get(guildId);
        const role = guild.roles.cache.find(role => role.name === roleName);
        await member.roles.add(role);
        return true;
    } catch (error) {
        console.error(`An error occurred while adding the role to the user ${member.username}`, error);
    }
}

module.exports = { addRole };