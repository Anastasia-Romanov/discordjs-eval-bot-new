module.exports = async (msg, args, helpers) => {
  let source = msg.content.slice(5);
  if (source.startsWith('```c') && source.endsWith('```')) source = source.slice(4, -3).trim();

  const fs = require('fs').promises;

  await fs.writeFile('in.c', source);
  const reply = await msg.reply('Compiling & Running...');
  const startTime = Date.now();
  let compileTime = startTime;
  let runTime = startTime;
  let result,
    fail = false;

  try {
    await helpers.runCommand('gcc in.c');
    compileTime = Date.now();
    result = await helpers.runCommand('./a.out');
  } catch (e) {
    result = String(e);
    fail = true;
  }

  runTime = Date.now();
  await reply.edit(`${fail ? 'Success' : 'Fail'}\nCompiled in ${compileTime - startTime}ms\nRan in ${runTime - startTime}ms\n\`\`\`${result.replaceAll('`', '​`')}\n\`\`\``);
  await fs.unlink('in.c');
  await fs.unlink('a.out');
};
