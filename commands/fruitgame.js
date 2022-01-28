const co = require('../co.js');

module.exports = async message => {

  const fruitList = '🍎 🥕 🍉 🍌 🥚'.split(' ');
  const generateFruit =()=> fruitList.random();
  const grid = [
    ...5,
  ].map(() => [
    ...5,
  ].map(() => generateFruit()));
  let score = 0;

  const content = () => ({ content: 'score: ' + score.toLocaleString(), components: co(grid.map((row, ri) => row.map((fruit, fi) => co.button(fruit === '🥚' ? 'SUCCESS' : fruit === '🍌' ? 'PRIMARY' : 'SECONDARY', undefined, {y: ri, x: fi,}, undefined, fruit)))), });

  const m = await message.channel.send(content());

  const pop = (x, y) => {
    let type = grid[y][x];
    if (type === '🥚') score += 50;
    else if (type === '🍌') score += 20;
    else score += 10;
    for (const i of y + 1) grid[y-i][x] = grid[y-i-1]?.[x] ?? generateFruit();
  };
  const around = (x, y, ignore=[]) => {
    const type = grid[y][x];
    const res = [
      [
        x,
        y,
      ],
    ];
    const directions = [
      [
        -1,
        -1,
      ], // top left
      [
        0,
        -1,
      ], // top
      [
        1,
        -1,
      ], // top right
      [
        -1,
        0,
      ], // left
      [
        1,
        0,
      ], // right
      [
        -1,
        1,
      ], // bottom left
      [
        0,
        1,
      ], // bottom
      [
        1,
        1,
      ], // bottom right
    ];

    const checked = (x, y) => ignore.concat(res).some(r => r[0] === x && r[1] === y);
    for (const [
      addX,
      addY,
    ] of directions) if (grid[y + addY]?.[x+addX] === type && !checked(x + addX, y+addY)) res.push(...around(x+addX,y+addY, res.concat(ignore)));
    return res;
  };

  const collector = m.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, });
  collector.on('collect', i => {
    const d = JSON.parse(i.customId);
    const near = around(d.x, d.y);
    if (near.length > 2) {
      for (const [
        popX,
        popY,
      ] of near.sort((a,b) => a[1] - b[1])) pop(popX, popY);
      if (near.length > 5) score += near.length * 20;
    }
    i.update(content());
    // message.channel.send(util.format("checking", d, grid[d.y][d.x], around(d.x, d.y)))
  });

};
