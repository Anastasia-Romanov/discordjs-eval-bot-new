const co = require('../co.js');

module.exports = async message => {
// lol
// this was a massive pain to write and debug while minified cause discord and 4000 char message limit
  const grid=[
      [
        1,
        0,
        0,
        0,
        0,
        0,
        1,
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        1,
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        1,
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        1,
      ],
      [
        1,
        0,
        0,
        0,
        0,
        0,
        1,
      ],
      [
        1,
        1,
        1,
        1,
        1,
        1,
        1,
      ],
    ],bricks=[
      [
        [
          -4,
          -4,
        ],
        [
          -4,
          0,
        ],
      ],
      [
        [
          -4,
          -4,
        ],
        [
          0,
          -4,
        ],
      ],
      [
        [
          -1,
          -1,
        ],
        [
          -1,
          -1,
        ],
      ],
      [
        [
          -3,
          -3,
        ],
        [
          0,
          0,
        ],
      ],
      [
        -[
          1,
          0,
        ],
        [
          0,
          0,
        ],
      ],
    ];let next,x=3,y=0,score=0,brick=bricks.random();const abs=Math.abs,max=(...e)=>e.sort((a,b)=>abs(b)-abs(a))[0];const content=()=>({content:'score: '+score,components:co(grid.slice(0,-1).map((i,r)=>i.slice(1,-1).map((i,e)=>co.button(abs(i)||'SECONDARY','⠀',{x:e,y:r,},!0)))),});function setPixel(i,r,e){grid[r][i+1]=e;}function hideBrick(){x>0&&setPixel(x-1,y,brick[0][0]?0:grid[y][x]),x<5&&setPixel(x+1-1,y,brick[0][1]?0:grid[y][x+1]),x>0&&y<4&&setPixel(x-1,y+1,brick[1][0]?0:grid[y+1][x]),x<5&&y<4&&setPixel(x+1-1,y+1,brick[1][1]?0:grid[y+1][x+1]);}function showBrick(){x>0&&setPixel(x-1,y,max(brick[0][0],grid[y][x])),x<5&&setPixel(x+1-1,y,max(brick[0][1],grid[y][x+1])),x>0&&y<4&&setPixel(x-1,y+1,max(brick[1][0],grid[y+1][x])),x<5&&y<4&&setPixel(x+1-1,y+1,max(brick[1][1],grid[y+1][x+1]));}function moveBrick(i,r){let e=!1;return-1==i&&x>0?grid[y][x-1]>0&&brick[0][0]||grid[y][x+1-1]>0&&brick[0][1]||grid[y+1][x-1]>0&&brick[1][0]||grid[y+1][x+1-1]>0&&brick[1][1]||(e=!0):1==i&&x<5?grid[y][x+1]>0&&brick[0][0]||grid[y][x+1+1]>0&&brick[0][1]||grid[y+1][x+1]>0&&brick[1][0]||grid[y+1][x+1+1]>0&&brick[1][1]||(e=!0):1==r&&y<4&&(grid[y+1][x]>0&&brick[0][0]||grid[y+1][x+1]>0&&brick[0][1]||grid[y+1+1][x]>0&&brick[1][0]||grid[y+1+1][x+1]>0&&brick[1][1]||(e=!0)),e&&(hideBrick(),x+=i,y+=r,showBrick()),e;}function rotateBrick(){const i=brick[0][0],r=brick[0][1],e=brick[1][0],c=brick[1][1];grid[y][x]>0&&e||grid[y+1][x]>0&&c||grid[y][x+1]>0&&i||grid[y+1][x+1]>0&&r||(hideBrick(),brick[0][0]=e,brick[1][0]=c,brick[1][1]=r,brick[0][1]=i,showBrick());}function checkLines(){let i=!1;for(let r=0;r<5;r++)if(grid[r].every(Boolean)){i=!0,score+=100+-(brick[0][0]+brick[0][1]+brick[1][1]+brick[1][0]||1)*10;for(let i=r;i>0;i--)grid[i]=grid[i-1];next=(()=>{for(let i=0;i<5;i++)grid[r+1][i+1]||(grid[r+1][i+1]=grid[r][i+1],grid[r][i+1]=0);}),grid[0]=[
    1,
    0,
    0,
    0,
    0,
    0,
    1,
  ];checkLines();}return i;}showBrick();const display=await message.channel.send(content()),controller=await message.channel.send({content:'​',components:co([
    co.button('PRIMARY',void 0,'left',void 0,'⬅️'),
    co.button('SECONDARY',void 0,'rotate',void 0,'🔁'),
    co.button('SECONDARY',void 0,'down',void 0,'⏬'),
    co.button('PRIMARY',void 0,'right',void 0,'➡️'),
  ]),});const interval=setInterval(async()=>{let _temp,gameOv;if(next)return _temp = next,next=void 0, _temp(),void await display.edit(content());moveBrick(0,1)||(hideBrick(),grid[y][x]=abs(max(brick[0][0],grid[y][x])),grid[y][x+1]=abs(max(brick[0][1],grid[y][x+1])),grid[y+1][x]=abs(max(brick[1][0],grid[y+1][x])),grid[y+1][x+1]=abs(max(brick[1][1],grid[y+1][x+1])),0==checkLines()&&0==y?(clearInterval(interval), gameOv=true,await display.edit({ content: content().content + '\n\ngame over', components: content().components, })):(x=3,y=0,brick=bricks.random(),showBrick())),!gameOv&&display.edit(content());},2100),collector=controller.createMessageComponentCollector({filter:i=>i.user.id===message.author.id,idle:36e5,});collector.on('collect',i=>{const r=i.customId;if('left'===r)moveBrick(-1,0);else if('right'===r)moveBrick(1,0);else if('rotate'===r)rotateBrick();else if('down'===r)for(;moveBrick(0,1););i.update({ ...controller, nonce: undefined, });});

};
