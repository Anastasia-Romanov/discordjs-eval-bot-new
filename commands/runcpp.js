module.exports = async (msg, args, helpers) => {
  let source = msg.content.slice(7);
  if (source.startsWith('```cpp') && source.endsWith('```')) source = source.slice(6, -3).trim();

  const fs = require('fs').promises;

  await fs.writeFile('in.cpp', source);
  const reply = await msg.reply('Compiling & Running...');

  const formatRes = res => `\`\`\`${res.replaceAll('`', '​`')}\n\`\`\``;

  const startTime = Date.now();
  let compileTime = null;
  let runTime = null;
  let result,
    compilerResult,
    fail = false;

  try {
    try {
      compilerResult = await helpers.runCommand('g++ in.cpp');
    } finally {
      compileTime = Date.now();
    }

    try {
      result = await helpers.runCommand('./a.out');
    } finally {
      runTime = Date.now();
    }
  } catch (e) {
    result = String(e);
    fail = true;
  }

  await reply.edit(`${!fail ? 'Success' : 'Fail :('}\nCompile time: ${compileTime - startTime}ms\nRun time: ${runTime ? `${runTime - compileTime}ms` : 'N/A'}\n${compilerResult ? formatRes(compilerResult) + '\n' : ''}${formatRes(result)}`);
  await fs.unlink('in.cpp').silence();
  await fs.unlink('a.out').silence();
};
