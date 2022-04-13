/* eslint-disable @typescript-eslint/triple-slash-reference */

/// <reference path="./command-tags.d.ts" />

import tagify from 'command-tags';
import { source } from 'common-tags';
import * as Discord from 'discord.js';
import * as assert from 'node:assert';
import { createServer } from 'node:http';
import * as path from 'node:path';
import { exit, hrtime } from 'node:process';
import { setTimeout as sleep } from 'node:timers/promises';
import * as util from 'node:util';
import { compileEval, EvalFlags, prepareCompiler } from './compile';
import * as helpers from './helpers';
import inspect = util.inspect;

const EMBED_MAX_LENGTH = 1024;

prepareCompiler().catch((err: unknown) => console.error('warning:', err));

{
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
  });

  server.listen(3000, () => console.log('website is alive'));
}

let client = new Discord.Client({
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
  rejectOnRateLimit: ['/'],
});

client = new Proxy(client, {
  get(target, propKey, receiver: unknown) {
    if (propKey === 'destroy') {
      return () => {
        console.log('stopping!');
        target.destroy();
        setImmediate(exit);
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Reflect.get(target, propKey, receiver);
  },
});

client.once('ready', async () => {
  assert.ok(client.isReady());

  try {
    const logChannel = await client.channels.fetch('795366538370088973');
    assert.ok(logChannel);
    assert.ok(logChannel.isText());
    await logChannel.send('hey guys');
  } catch (err) {
    console.error('warning: failed to send login message', err);
  }

  console.log('logged in as', client.user.tag);

  setInterval(() => {
    if (!client.listeners('messageCreate').length || !client.token) {
      console.error('error: missing token and/or message listeners');
      client.destroy();
    }
  }, 10000);
});

const codeBlockPattern = /^```(?:js|ts|(?:type|java)script)\n(.*)```$/s;

let botPrefix: unknown = '';
client.on('messageCreate', async (message) => {
  if (typeof botPrefix !== 'string') botPrefix = '';
  assert.ok(typeof botPrefix === 'string');

  if (!message.content.startsWith(botPrefix)) return;

  const [cmd, ...args] = message.content
    .slice(botPrefix.length)
    .trim()
    .split(/ +/);

  if (!cmd || message.author.bot) return;

  try {
    switch (cmd) {
      case 'refresh': {
        await message.channel.send(':ok:');
        client.destroy();
        break;
      }

      case 'eval': {
        const tags = tagify(
          {
            negativeNumbers: true,
            string: args.join(' '),
          },
          'silent',
          'wait',
          'no-ansi',
          'stack',
          'compact',
          {
            depth: Number,
          }
        );

        let code = tags.newString;
        const flags = tags.data as unknown as EvalFlags;

        for (const match of tags.matches)
          (flags as unknown as Record<string, boolean>)[match] = true;

        const codeBlockMatch = codeBlockPattern.exec(code);
        if (codeBlockMatch?.[1]) code = codeBlockMatch[1];

        if (!code) {
          await message.channel.send("i can't eval your thoughts, cmon");
          return;
        }

        let resultStr = '';
        let errored = false;
        const startTime = hrtime.bigint();
        let compileTime: bigint, runTime: bigint;

        try {
          const compiled = await compileEval(code, flags).catch((err) => {
            flags.stack = false;
            throw err;
          });

          compileTime = hrtime.bigint() - startTime;

          const evalExports = { default: void 0 as unknown };

          await compiled(
            evalExports,
            require,
            path.resolve(__dirname, '../<eval>.ts'),
            path.resolve(__dirname, '..'),
            {
              client,
              message,
              args,
              flags,
              prefix: {
                get() {
                  return botPrefix;
                },
                set(newPrefix) {
                  botPrefix = newPrefix;
                },
              },
              compileEval,
              require,
            }
          );

          const result = await evalExports.default;

          runTime = hrtime.bigint() - startTime - compileTime;
          resultStr = inspect(result, {
            depth: flags.depth,
            colors: !flags['no-ansi'],
            compact: flags.compact,
          });
        } catch (err) {
          errored = true;
          if (flags.stack && err instanceof Error && err.stack)
            resultStr = err.stack;
          else resultStr = String(err);
        }

        if (flags.silent) return;

        const embed = new Discord.MessageEmbed()
          .setTitle('Eval')
          .addFields([
            {
              name: 'Input',
              value: source`
            \`\`\`ts
            ${helpers.truncate(
              Discord.Util.escapeCodeBlock(code),
              EMBED_MAX_LENGTH - 10
            )}
            \`\`\`
          `,
            },
            {
              name: 'Output',
              value: source`
            \`\`\`${flags['no-ansi'] ? 'js' : 'ansi'}
            ${helpers.truncate(
              Discord.Util.escapeCodeBlock(resultStr),
              EMBED_MAX_LENGTH - 12
            )}
            \`\`\`
          `,
            },
          ])
          .setDescription(
            errored
              ? '**ERROR**'
              : `Compiled in **${
                  Number(compileTime!) / 1_000_000
                }ms**, ran in **${Number(runTime!) / 1_000_000}ms**.`
          )
          .setColor(errored ? 0xee3333 : 0x334433);

        await message.channel.send({ embeds: [embed] });
        break;
      }

      case 'help': {
        const embed = new Discord.MessageEmbed()
          .setTitle('Eval Help')
          .setDescription(
            source`
            **Running code**
            Discord.js Eval Bot+++ has many more features than its competitors.
            TypeScript support is **built-in**, as well as support for **ESM Imports**, **\`do\` expressions**, and **top-level async/await**.

            Here is an example of valid eval code:
            \`\`\`ts
            import * as commonTags from 'common-tags';

            const fetched = await async do {
              const msg = await message.channel.fetch('123456789012345678');
              msg.content
            };

            await message.chanel.send({
              content: do {
                if (fetched.startsWith('hi')) 'hi!'
                else 'no hi :('
              }
            });
            \`\`\`

            Code is executed using the eval command:
            \`\`\`
            eval import * as ...
            \`\`\`You can optionally include it in a code block:
            \`\`\`
            ${source`
              eval \`\`\`ts
              import * as ...
              \`\`\`
            `.replaceAll('```', '``\u200B`')}
            \`\`\`

            **Custom commands**
            You can create custom commands that are saved between restarts be using the \`helpers.registerCommand\` function.

            \`\`\`ts
            helpers.registerCommand(
              'my-command',
              async (msg: Discord.Message, args: string[], helpers: typeof helpers) => {

              }
            );
            \`\`\`

            **Flags**
            --silent prevents the bot from responding
            --wait wraps your eval in a promise
            --no-ansi uses discord's built in highlighting
            --stack displays the stack of errors
            --compact makes eval results smaller

            > if you screw up the bot, the \`refresh\` command might fix it
          `
          )
          .setColor(0x334433);
        await message.channel.send({ embeds: [embed] });
        break;
      }

      default: {
        if (!(await helpers.fileExists(`./commands/${cmd}.js`))) return;
        const handler = (await import(`./commands/${cmd}`)) as (
          message: Discord.Message,
          args: string[],
          helpers: typeof import('./helpers')
        ) => void | Promise<void>;

        await handler(message, args, helpers);
        break;
      }
    }
  } catch (err) {
    console.error(err);
    await message.channel.send(String(err)).catch(() => void 0);
  }
});

const stop = () => {
  client.destroy();
};

process.once('SIGINT', stop).once('SIGHUP', stop);

const login = (): Promise<void> => {
  return client
    .login()
    .then(() => void 0)
    .catch(async (err) => {
      if (err instanceof Discord.RateLimitError) {
        console.error('RateLimit hit while logging in', err);
        await sleep(err.timeout);
        return login();
      }
      throw err;
    });
};

void login();
