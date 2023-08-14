const mongoose = require('mongoose');

const GuildConfig = new mongoose.Schema({
    guildId: {
      type: String,
      default: null
    },
    data: {
      type: Object,
      default: () => ({})
    }
  });
  
  module.exports.GuildConfig = mongoose.model('DiscordGuild', GuildConfig);