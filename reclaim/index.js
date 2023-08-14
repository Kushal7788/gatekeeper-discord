const scheduler = require("./utils/scheduler");
const kickScheduler = require("./utils/kick-scheduler");
require('dotenv').config();

// Sending reclaim url to user

const globalScheduler = async () => {
    try {
        console.log('Running the gloabl scheduler. Current date:', Date.now());
        await scheduler().then(() => console.log('Scheduler finished.'));
        await kickScheduler().then(() => console.log('Kick scheduler finished.'));
    } catch (error) {
        console.error('An error occurred:', error);
    }
    console.log('Global scheduler finished.');
};

module.exports = globalScheduler;