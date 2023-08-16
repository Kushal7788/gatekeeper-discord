const { getMember } = require("./get-member");
const { addRole } = require("./add-role");
const { sendMessage } = require("./send-dm");
const { UserConfig } = require('../../models/user-config');
const { GuildConfig } = require('../../models/guild-config.js');

const isInteger = (value) => {
    if (isNaN(value)) {
        return false;
    }
    const x = parseFloat(value);
    return (x | 0) === x;
}

const getIntegerValue = (value) => {
    if (isInteger(value)) {
        return parseInt(value);
    }
    else {
        return parseFloat(value);
    }
}

const verifyMember = async (check) => {
    try {
        const proofParam = check.data.proofParams.param;
        const member = await getMember(check.data.memberId, check.data.guildId);
        const guildConfig = await GuildConfig.findOne({ guildId: check.data.guildId });
        const VERIFIED_ROLE = guildConfig.data.verificationRole;
        const userConfig = await UserConfig.findOne({ guildMemberId: check.data.guildId + check.data.memberId });
        if(!userConfig) {
            throw new Error(`User config not found for ${check.data.memberId} in ${check.data.guildId}`);
        }
        let isMemberVerified = false;
        if (guildConfig.data.condition === 'EQ') {
            proofParam === guildConfig.data.value ? isMemberVerified = true : isMemberVerified = false;
        }
        else if (guildConfig.data.condition === 'INC') {
            proofParam.includes(guildConfig.data.value) ? isMemberVerified = true : isMemberVerified = false;
        }
        else if (guildConfig.data.condition === 'NINC') {
            proofParam.includes(guildConfig.data.value) ? isMemberVerified = false : isMemberVerified = true;
        }
        else if (guildConfig.data.condition === 'GT') {
            if (isInteger(proofParam)) {
                getIntegerValue(proofParam) > getIntegerValue(guildConfig.data.value) ? isMemberVerified = true : isMemberVerified = false;
            }
            else {
                isMemberVerified = false;
            }
        }
        else if (guildConfig.data.condition === 'LT') {
            if (isInteger(proofParam)) {
                getIntegerValue(proofParam) < getIntegerValue(guildConfig.data.value) ? isMemberVerified = true : isMemberVerified = false;
            }
            else {
                isMemberVerified = false;
            }
        }
        else if (guildConfig.data.condition === 'GTE') {
            if (isInteger(proofParam)) {
                getIntegerValue(proofParam) >= getIntegerValue(guildConfig.data.value) ? isMemberVerified = true : isMemberVerified = false;
            }
            else {
                isMemberVerified = false;
            }
        }
        else if (guildConfig.data.condition === 'LTE') {
            if (isInteger(proofParam)) {
                getIntegerValue(proofParam) <= getIntegerValue(guildConfig.data.value) ? isMemberVerified = true : isMemberVerified = false;
            }
            else {
                isMemberVerified = false;
            }
        }


        if (isMemberVerified) {
            try {
                await addRole(member, check.data.guildId, VERIFIED_ROLE);
                userConfig.data = {
                    ...userConfig.data,
                    isVerified: true,
                };
                await userConfig.save();
                await sendMessage(member, 'You have been verified!');
            }
            catch (err) {
                console.log(err);
            }
        }
        else {
            await sendMessage(member, 'You have not been verified due to not fitting the criteria.');
        }
        return isMemberVerified;
    } catch (error) {
        console.error(error);
    }
}

module.exports = { verifyMember };