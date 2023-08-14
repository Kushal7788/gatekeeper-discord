const { getReclaimUrlFunction } = require('./get-reclaim');
const QRCode = require('qrcode');


// Sending reclaim url to user

const sendReclaimUrl = async (member, guild, providerType) => {
    try {
        const url = await getReclaimUrlFunction(member, guild.id, providerType);
        if (!url || url === '') {
            console.log(`Could not create reclaim url for ${member.user.username}.`);
        } else {
            console.log(`Sending a QR code message to ${member.user.username}.`)
            QRCode.toFile(`qrimages/${member.user.id}.png`, url, function (err) {
                if (err) {
                    console.log('FATAL:', err);
                }
                member.user.send({
                    content: `Hello, "${member.user.username}!" You are not verified in the "${guild.name}". Please verify soon to avoid being kicked out of the server\n\nUrl for verification: ${url}`,
                    files: [{ attachment: `qrimages/${member.user.id}.png` }]
                })
            });
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = { sendReclaimUrl };