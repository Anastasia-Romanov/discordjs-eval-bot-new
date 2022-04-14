module.exports = (m, [
  id,
]) => m.channel.send(`https://top.gg/bot/${id?.match(/\d{17,19}/)?.[0] ?? m.client.user.id}`);
