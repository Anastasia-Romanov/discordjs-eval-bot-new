const Discord = require("discord.js")

module.exports = async (msg, args, helpers) => {
  try {
    const fs = require('fs');

    const path = require('path');

    const source = msg.content.slice(4);
    let interpreters;
    let values;

    try {
      interpreters = require(`@doinkythederp/bismium-interpreter`);
      values = require(`@doinkythederp/bismium-runtime`);
    } catch {
      await fs.promises.writeFile(path.join(process.cwd(), '.npmrc'), `//npm.pkg.github.com/:_authToken=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\n@doinkythederp:registry=https://npm.pkg.github.com`);
      await helpers.install(`@doinkythederp/bismium-interpreter@latest @doinkythederp/bismium-runtime@latest`);
      interpreters = require(path.join(process.cwd(), `node_modules/@doinkythederp/bismium-interpreter/lib/src/index.js`));
      values = require(path.join(process.cwd(), `node_modules/@doinkythederp/bismium-runtime/lib/src/index.js`));
    }

    globalThis.bis = {
      interpreters,
      values
    };
    if (!source) return msg.reply('bismium installed');
    const compiled = await new interpreters.ProgramInterpreter().run(source);
    const result = await (globalThis.bisRuntime ?? new values.Runtime({
      string: new Map(),
      number: new Map(),
      object: new Map()
    })).start(compiled, globalThis.bisCtx ?? new Map());
    await msg.reply('```js\n' + result?.toJS() + '\n```');
  } catch (e) {
    msg.reply('```js\n' + e.stack + '\n```').catch(() => {});
  }
}