const mongoose = require('mongoose');

const UserConfig = new mongoose.Schema({
    guildMemberId: {
      type: String,
      default: null
    },
    data: {
      type: Object,
      default: () => ({})
    }
  });
  
  module.exports.UserConfig = mongoose.model('DiscordUser', UserConfig);