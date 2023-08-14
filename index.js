// Require the necessary discord.js classes
const client = require('./client/bot');
const {Events } = require('discord.js');
const globalScheduler = require('./reclaim');
const { newJoiner } = require('./reclaim/utils/new-joiner');
const express = require("express");
const cors = require("cors");
require('dotenv').config();
var cookieParser = require("cookie-parser");
var mongoose = require("mongoose");
var indexRouter = require("./routes/index");

const app = express();
app.use(cors());
app.set("trust proxy", true);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Express Set-up
var mongoDB = process.env.MONGO_URL;
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

app.use("/", indexRouter);

app.use("*", function (req, res, next) {
    res.status(405).json({
        success: false,
        message: "Method Not Allowed!",
    });
});

app.listen(process.env.PORT, () => {
    console.log(
        `Server running on Port: ${process.env.PORT}.`
    );
});

// Command handling
client.on('message', (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Add other commands here if needed
    if (command === 'ping') {
        message.channel.send('Pong!');
    }
});

// Receiving command interactions
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        }
        else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

client.on('ready', async () => {
    await delay(3000);
    console.log('Bot is ready.');
    const schedulerTimer = 1000 * 60 * 60 * 3; // 6 hours
    // Schedule the role check and message sending
    // await checkAllVerificationStatus();
    try {
        await globalScheduler();
        setInterval(async () => {
            await globalScheduler();
        }, schedulerTimer);
    } catch (error) {
        console.error('An error occurred:', error);
    }

});

client.on('guildMemberAdd', async (member) => {
    await newJoiner(member);
});

module.exports = app;


