const { UserConfig } = require('../../models/user-config');

const removeMember = async (member) => {
    try {
        await UserConfig.deleteOne({ guildMemberId: member.guild.id + member.user.id });
    } catch (error) {
        console.error(`An error occurred while adding the role to the user ${member.username}`, error);
    }
}

module.exports = { removeMember };