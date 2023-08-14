const sendMessage = async (member, message) => {
    try {
        await member.user.send({content: message});
    } catch (error) {
        console.error('error in sendMessage: ', error);
    }
}

module.exports = { sendMessage };