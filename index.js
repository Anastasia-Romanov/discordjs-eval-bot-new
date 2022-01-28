/* eslint-disable no-unused-vars */
require('./co.js');
const Discord = require('discord.js');
const builders = require('@discordjs/builders');
const util = require('util'),
  { inspect, } = util;
const fetch = require('node-fetch');
const Tagify = require('command-tags');
const fs = require('fs');
const typescript = require('typescript');
const babel = require('@babel/core');
const co = require('./functions.js');
const fastify = require('fastify')();
fastify.get('/', (req, res) => res.send('OK'));
fastify.listen(3000, '0.0.0.0', () => console.log('website is alive'));
// eslint-disable-next-line no-shadow-restricted-names
const eval = global.eval;
const ___ = {
  tokenRegex: new RegExp(
    `${process.env.DISCORD_TOKEN}|${process.env.DISCORD_TOKEN.split(
      '.'
    ).last()}`,
    'gi'
  ),
  normalise(str = '', ts) {
    str = str
      .trim()
      .replace(/say\(/g, 'message.channel.send(')
      .replace(/client\.token|process\.env\.DISCORD_TOKEN/g, 'client.faketoken')
      .replace(/<@!?(\d{16,22})>/g, 'client.users.cache.get("$1")')
      .replace(/<@&(\d{16,22})>/g, 'message.guild.roles.cache.get("$1")')
      .replace(/<#(\d{16,22})>/g, 'client.channels.cache.get("$1")')
      .replace(/<a?:\w{2,32}:(\d{16,22})>/g, 'client.emojis.cache.get("$1")');
    str = str.startsWith('{') && str.endsWith('}') ? `(${str})` : str;
    try {
      str = babel.transformSync(`(async () => do {${str}})()`, {
        plugins: [
          '@babel/plugin-transform-typescript',
          '@babel/plugin-proposal-do-expressions',
        ],
      }).code;
    } catch {
      // explicitly empty
    }
    return str;
  },
};
const helpers = {
  extend: (key, cb) => {
    let structure;
    try {
      structure =
        Discord[key] ||
        require(`./node_modules/discord.js/src/structures/${key}`);
    } catch (e) {
      console.log(e);
      throw new Error('Unknown structure ' + key);
    }
    const descriptors = Object.getOwnPropertyDescriptors(structure.prototype);
    const desc = { super: Object.getPrototypeOf(structure), };
    for (const key of Object.keys(descriptors))
      desc[key] = descriptors[key].get || descriptors[key].value;
    const value = cb(desc);
    const define = Object.getOwnPropertyDescriptors(value);
    const /** @type {object} */ res = {},
      /** @type {object} */ static = {};
    for (let key of Object.keys(define)) {
      const obj = key.startsWith('static_') ? static : res;
      const { value, get, set, } = define[key];
      if (key.startsWith('static_')) key = key.slice(7);
      if (value)
        obj[key] = {
          value: value,
          configurable: true,
          writable: true,
          enumerable: typeof value !== 'function',
        };
      else if (get)
        obj[key] = {
          configurable: true,
          enumerable: false,
          get: get,
          set: set,
        };
    }
    Object.defineProperties(structure.prototype, res);
    Object.defineProperties(structure, static);
  },
  install: (packageName, version) => {
    const name = version ? `${packageName}@${version}` : packageName;
    return helpers.runCommand(`npm install ${name}`);
  },
  runCommand: (command, options) => {
    const { exec, } = require('child_process');
    return new Promise((resolve, rej) => {
      exec(
        command,
        (err, res) => {
          if (err) rej(err);
          else resolve(res);
        },
        options
      );
    });
  },
  runCommandSync: (command, options) =>
    require('child_process').execSync(command, options),
  registerCommand: (name, run) => {
    if (typeof name !== 'string')
      throw new Error('The command name must be a string.');
    name = name.split('.')[0].split('/').last();
    if (typeof run !== 'function')
      throw new Error('The second argument must be a function.');
    fs.writeFileSync(
      `./commands/${name}.js`,
      Buffer.from(
        `const Discord = require("discord.js")\n\nmodule.exports = ${run}`
      )
    );
    delete require.cache[require.resolve(`./commands/${name}`)];
    return true;
  },
  deleteCommand: (name) => {
    if (typeof name !== 'string')
      throw new Error('The command name must be a string.');
    name = name.split('.')[0].split('/').last();
    if (!fs.existsSync(`./commands/${name}.js`))
      throw new Error('Unknown Command');
    fs.unlinkSync(`./commands/${name}.js`);
    return true;
  },
  co,
};
Object.freeze(helpers);

helpers.extend('GuildChannel', ({ delete: del, }) => ({
  async delete() {
    return this instanceof Discord.TextChannel
      ? this
      : del.apply(this, arguments);
  },
}));
helpers.extend('TextChannel', () => ({
  // start typing for x * 9 seconds
  // eg: startTyping(5) // type for 45 seconds
  startTyping(seconds) {
    if (typeof seconds !== 'number' || isNaN(seconds)) seconds = 1;
    if (this.client.user._typing.has(this.id)) {
      const entry = this.client.user._typing.get(this.id);
      entry.seconds = seconds * 9 || entry.seconds + 9;
      return Promise.resolve(entry);
    }

    const entry = {
      seconds: seconds * 9 || Infinity,
      interval: setInterval(() => {
        if (entry.seconds !== Infinity && (entry.seconds -= 9) <= 0)
          return clearInterval(entry.interval);
        this.sendTyping().catch((error) => {
          clearInterval(entry.interval);
          this.client.user._typing.delete(this.id);
          throw error;
        });
      }, 9000),
    };

    this.client.user._typing.set(this.id, entry);

    return this.sendTyping()
      .then(() => entry)
      .catch((error) => {
        clearInterval(entry.interval);
        this.client.user._typing.delete(this.id);
        throw error;
      });
  },
}));

helpers.extend('Client', () => ({
  get faketoken() {
    return 'password123';
  },
  set faketoken(val = 'password123') {
    Object.defineProperty(this, 'faketoken', {
      get: () => val,
      set: (v) => {
        val = v;
      },
    });
  },
}));

const client = new Discord.Client({
  intents: [
    'GUILDS',
    'GUILD_MEMBERS',
    'GUILD_BANS',
    'GUILD_EMOJIS_AND_STICKERS',
    'GUILD_INTEGRATIONS',
    'GUILD_WEBHOOKS',
    'GUILD_INVITES',
    'GUILD_VOICE_STATES',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS',
    'GUILD_MESSAGE_TYPING',
    'DIRECT_MESSAGES',
    'DIRECT_MESSAGE_REACTIONS',
    'DIRECT_MESSAGE_TYPING',
  ],
  rejectOnRateLimit: [
    '/',
  ],
});

let prefix = '';

client.on('ready', async () => {
  (await client.channels.fetch('795366538370088973')).send('hey guys');
  console.log('logged in as', client.user.id);
  client.user._typing = new Map();
  // doinkythederp's 100% secure security block for stuff
  setInterval(() => {
    if (!client._events.messageCreate || !client.token) process.exit();
  }, 10000);
  const wsD = client.ws.destroy;
  const clD = client.destroy;
  Object.defineProperty(client, 'destroy', {
    value: function destroy() {
      console.log('destoryio');
      clD.call(this);
      process.exit();
    },
  });
  Object.defineProperty(client.ws, 'destroy', {
    value: function destroy() {
      console.log('destoryio');
      wsD.call(this);
      process.exit();
    },
  });
});

client.on('messageCreate', async (message) => {
  if (typeof prefix !== 'string') prefix = '';
  if (!message.content.startsWith(prefix)) return;
  let [
    cmd,
    ...args
  ] = message.content.slice(prefix.length).trim().split(/ +/);
  if (cmd === 'refresh')
    await message.channel.send('wtf bro? ugh whatever, i\'ll be back ig'),
    process.exit();

  if (cmd !== 'eval') {
    if (!cmd.match(/^[\w-]+$/) || !fs.existsSync(`./commands/${cmd}.js`))
      return;
    try {
      return await require(`./commands/${cmd}`)(message, args, helpers);
    } catch (e) {
      return message.channel.send(String(e)).silence();
    }
  }

  const tags = Tagify(
    {
      prefix: '(--|// ?)',
      negativeNumbers: true,
      string: ` ${args.join(' ')}`,
    },
    [
      'async', // wrap eval in an async function
      'function', // wrap eval in a function
      'type', // type while evaling
      'silent', // dont send a response
      'delete', // delete the eval command
      'stack', // show error stack
      'wait', // manually resolve/reject
      'ts', // use typescript
      'no-ansi', // use old syntax highlighting

      // inspect options
      'showHidden',
      'showProxy',
      {
        depth: Number,
        require: Array, // --require ["Message"] -> Message.xyz // shortcut for Discord.Message
        '(max(Array|String)|break)Length': Number,
        compact: /(true|false|\d+)/, // can be a boolean or a number
        reduce: String, // --reduce number -> [1, 2, 3] // 6
      },
    ]
  );
  tags.string = tags.newString;
  args = tags.newString.split(' ');
  let oldMatches = tags.matches;
  tags.matches = {};
  for (const i of oldMatches) tags.matches[i] = true;
  Object.assign(tags.matches, tags.data);
  tags.matched = oldMatches.length;
  {
    const normalise = ___.normalise;
    const testCo = (ck) =>
      message.channel.send({ content: '\u200b', components: co(ck), });
    let toEval = tags.string;
    console.log(
      message.author.username,
      'evaling',
      toEval,
      'in',
      message.guild.name
    );
    if (toEval.startsWith('```') && toEval.endsWith('```')) {
      toEval = toEval
        .replace(/js|javascript|ts/, '')
        .slice(3, -4)
        .trim();
    }
    if (
      message.attachments.size &&
      message.attachments.first().name.includes('.txt')
    ) {
      toEval += await fetch(message.attachments.first().url)
        .then((res) => res.text())
        .default('');
    }
    if (!toEval)
      return message.channel.send(
        'I can\'t evaluate your thoughts, come on. Specify something.'
      ); // legacy :)

    if (tags.matches.require)
      toEval = `const { ${tags.matches.require.join(
        ', '
      )} } = Discord\n\n${toEval}`;
    if (
      tags.matches.type &&
      message.channel
        .permissionsFor(client.user)
        ?.has([
          'SEND_MESSAGES',
          'READ_MESSAGE_HISTORY',
          'VIEW_CHANNEL',
        ])
    )
      await message.channel.startTyping(0);
    let t = process.hrtime();
    const promise = new Promise((resolve, reject) => {
      const normalised = normalise(toEval, tags.matches.ts);
      let d, ___, promise;
      // let ___eval = str => eval(tags.matches.typescript ? typescript.transpile(str) : str)
      d = eval(normalised);

      if (!tags.matches.wait || !toEval.match(/resolve|reject/)) resolve(d);
    });

    return promise
      .then(async (res) => {
        if (client.user._typing.has(message.channel.id)) {
          const entry = client.user._typing.get(message.channel.id);
          clearInterval(entry.interval);
          client.user._typing.delete(message.channel.id);
        }
        if (Array.isArray(res) && res.every((d) => d instanceof Promise))
          res = await Promise.all(res);
        if (tags.matches.reduce && Array.isArray(res)) {
          const red = res.reduce((prev, v) => {
            if (tags.matches.reduce === 'number') return v + prev;
            return v?.[tags.reduce] + prev;
          }, 0);
          if (!isNaN(red)) res = red;
        }
        if (
          tags.matches.delete &&
          message.channel.permissionsFor(client.user).has('MANAGE_MESSAGES')
        )
          await message.delete();
        if (tags.matches.silent) return;
        const time = process.hrtime.format(process.hrtime(t));

        res =
          toEval.includes('.toString()') && typeof res === 'string'
            ? res
            : inspect(res, {
              depth: 0,
              colors: !tags.matches['no-ansi'],
              ...tags.matches,
            });
        console.log('eval result:', res);
        res = res.replace(___.tokenRegex, 'password123');
        let embed;
        if (toEval.length > 1014) toEval = '...';
        if (res.length < 1014)
          embed = new Discord.MessageEmbed()
            .setTitle('Eval')
            .setDescription(`**Executed in ${time}.**`)
            .addField(
              'Input',
              `\`\`\`${tags.matches.ts ? 'ts' : 'js'}\n${toEval.replace(
                /```/g,
                '``\u200b`‎'
              )}\n\`\`\``
            )
            .addField(
              'Output',
              `\`\`\`${tags.matches['no-ansi'] ? 'js' : 'ansi'}\n${
                res.replace(/```/g, '``\u200b`') || '\u200b'
              }\n\`\`\``
            )
            .setColor('#303136');
        else {
          if (res.length > 2048) res = res.slice(0, 2038);
          embed = new Discord.MessageEmbed()
            .setAuthor('Eval')
            .setTitle('Output')
            .setDescription(
              `\`\`\`js\n${res.replace(/```/g, '``\u200b`')}\n\`\`\``
            )
            .addField(
              'Input',
              `\`\`\`${tags.matches.ts ? 'ts' : 'js'}\n${
                toEval.replace(/```/g, '``\u200b`') || '\u200b'
              }\n\`\`\``
            )
            .setColor('#303136')
            .setFooter(`Executed in ${time}.`);
        }

        if (message._eval)
          return message.channel.messages
            .edit(message._eval, { embeds: [
              embed,
            ], })
            .catch((e) => {
              delete message._eval;
              throw e;
            });
        else return message.channel.send({ embeds: [
          embed,
        ], });
      })
      .catch((e) => {
        if (tags.matches.silent) return;
        const time = process.hrtime.format(process.hrtime(t));
        if (client.user._typing.has(message.channel.id)) {
          const entry = client.user._typing.get(message.channel.id);
          clearInterval(entry.interval);
          client.user._typing.delete(message.channel.id);
        }
        if (toEval.length > 1014) toEval = '...';
        const embed = new Discord.MessageEmbed()
          .setTitle('Eval')
          .setDescription('**ERROR**')
          .addField(
            'Input',
            `\`\`\`${tags.matches.ts ? 'ts' : 'js'}\n${toEval.replace(
              /```/g,
              '``\u200b`'
            )}\n\`\`\``
          )
          .addField(
            'Output',
            `\`\`\`js\n${
              !tags.matches.stack || e.stack?.length > 1014
                ? e.message
                : e.stack
            }\n\`\`\``
          )
          .setColor('#fe4753')
          .setFooter(`Failed in ${time}.`);

        if (message._eval)
          return message.channel.messages
            .edit(message._eval, { embeds: [
              embed,
            ], })
            .catch((e) => {
              delete message._eval;
              throw e;
            });
        else return message.channel.send({ embeds: [
          embed,
        ], });
      })
      .then((msg) => (msg ? (message._eval = msg.id) : msg));
  }
});

client.on('messageUpdate', async (old, current) => {
  if (current.partial) await current.fetch().silence();
  if (old.content === current.content) return;
  client.emit('messageCreate', current);
});

client.login();

process.env = { PATH: process.env.PATH, };
