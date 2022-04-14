const fs = require('fs').promises;
const { spawn } = require('child_process');

/**
 * @param {string} process
 * @param {string[]} args
 * @returns {Promise<string>}
 */
function runCommand(process, args) {
  const child = spawn(process, args);
  return new Promise((resolve, reject) => {
    let res = '';

    child.stdout.on('data', (data) => {
      res += data;
    });

    child.stderr.on('data', (data) => {
      res += data;
    });

    child.on('close', (code) => {
      if (code === 0) resolve(res);
      else reject(res);
    });
  });
}

const RESPONSE = Symbol('runcpp.response');

module.exports = async (msg) => {
  let source = msg.content.slice(7);
  if (source.startsWith('```cpp') && source.endsWith('```'))
    source = source.slice(7, -3).trim();

  await fs.writeFile('main.cpp', source);
  const compilingMessage = 'Compiling & Running...';
  const reply = msg[RESPONSE]
    ? await msg[RESPONSE].edit(compilingMessage)
    : await msg.reply(compilingMessage);
  msg[RESPONSE] = reply;

  let compileTime = null;
  let runTime = null;
  let compilerResult = null;
  let result = null;
  let fail = false;

  const startTime = Date.now();
  try {
    compilerResult = await runCommand('g++', ['main.cpp']);
    compileTime = Date.now();
  } catch (res) {
    fail = true;
    compilerResult = res;
  } finally {
    compileTime = Date.now();
  }

  if (!fail)
    try {
      result = await runCommand('./a.out', []);
    } catch (res) {
      fail = true;
      result = res;
    } finally {
      runTime = Date.now();
    }

  const response = [
    `${fail ? 'Fail' : 'Success'}`,
    `Compiled in ${compileTime - startTime}ms`
  ];

  if (runTime) response.push(`Ran in ${runTime - compileTime}ms`);
  if (compilerResult)
    response.push(
      '```cpp',
      '// Warnings & Errors',
      compilerResult.replaceAll('`', '​`'),
      '```'
    );

  if (result) response.push('```', result.replaceAll('`', '​`'), '```');

  await reply.edit(response.join('\n'));
  await fs.unlink('main.cpp');
  if (runTime) await fs.unlink('a.out');
};
