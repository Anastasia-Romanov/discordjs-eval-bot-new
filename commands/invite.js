const Discord = require("discord.js")

module.exports = (message, [id, permissions]) => message.channel.send(`https://discord.com/oauth2/authorize?scope=bot%20applications.commands&client_id=${id?.match(/\d{17,19}/)?.[0] ?? message.client.user.id}&permissions=${permissions ?? 0}`)