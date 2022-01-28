const Discord = require("discord.js")

module.exports = async (message, args) => {
const params = [ "star", "background", "shadow", "shadowOpacity" ];

// straight from the discordjs guide because im too lazy
function getUserFromMention(mention) {
 if (!mention) return;

 if (mention.startsWith('<@') && mention.endsWith('>')) {
 mention = mention.slice(2, -1);

 if (mention.startsWith('!')) {
 mention = mention.slice(1);
 }

 return message.client.users.cache.get(mention);
 }
}

 args = args.map(a => getUserFromMention(a)?.displayAvatarURL({ format: "png" }) || a);

 const searchParams = new URLSearchParams();

 for (let i = 0; i < params.length; i++) {
 const paramName = params[i];
 if (args[i]) {
 searchParams.set(paramName, args[i]);
 }
 }

 return message.channel.send(`https://starboard-image-gen.thwampus.repl.co/generateImage?${searchParams.toString()}`);
}