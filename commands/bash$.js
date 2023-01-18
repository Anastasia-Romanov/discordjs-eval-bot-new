function createShellExecutor(shell) {
  return async (msg) => {
    const source = msg.content.split(' ').slice(1).join(' ');

    const runCommand = (cmd) =>
      new Promise((res) => {
        const { spawn } = require('child_process');

        const cp = spawn(shell, ['-c', cmd]);
        let data = '';
        cp.stdout.on('data', (d) => (data += d));
        cp.stderr.on('data', (d) => (data += d));
        const updateTimer = setInterval(() => {
          reply
            .edit(
              '``​`sh\n' + data.slice(0, 1950) + '\n[STILL RUNNING]' + '\n``​`​'
            )
            .silence();
        }, 10000);
        cp.on('close', (c) => {
          clearInterval(updateTimer);
          c ? res(data + `\n[EXIT CODE ${c}]`) : res(data);
        });
      });

    const reply = await msg.reply('Running shell commands...');
    await reply.edit(
      '``​`sh\n' + (await runCommand(source)).slice(0, 1975) + '\n``​`‎'
    );
  };
}

module.exports = createShellExecutor('bash');
module.exports.createShellExecutor = createShellExecutor;
