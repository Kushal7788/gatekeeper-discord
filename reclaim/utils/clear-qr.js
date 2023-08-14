const fs = require('node:fs');

const clearQRImages = async() => {
    try {
        const images = fs.readdirSync('./qrimages');
        for (const image of images) {
            fs.unlinkSync(`./qrimages/${image}`);
        }
        return true;
    } catch (error) {
        console.error(error);
    }
}

module.exports = { clearQRImages };