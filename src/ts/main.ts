import * as PIXI from 'pixi.js-legacy'
import {initalizeTextures, Spin, symbolChances, slot} from './spinCalc'
import {randomInt} from './functions'

let spritesNow: PIXI.Sprite[][] = [];  
let sp: Spin;
let stake: number = 10;
let bal: number = 10000.00;
let tWin: number = 0;
let showLines: PIXI.Ticker;
const bets: number[] = [
  0.5,
  1,
  2.5,
  5,
  10,
  20,
  40,
  50
]

enum States { // States of spin
  idle,
  spinning,
  resultWaiting,
  resultDone,
  stopping
}

// Creating Pixi app
export const app = new PIXI.Application({ 
  height: window.innerHeight,
  width: window.innerWidth,
  backgroundColor: 0x1099bb,
  transparent: false,
  antialias: false
});

PIXI.settings.PRECISION_FRAGMENT = PIXI.PRECISION.HIGH;
PIXI.settings.ROUND_PIXELS = true;
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

document.body.appendChild(app.view);

if(window.devicePixelRatio > 1.5){
  console.log(`Pixel ratio - ${window.devicePixelRatio}`)
  app.loader.baseUrl = 'src/img/100px';
}else{
  app.loader.baseUrl = 'src/img/300px';
}


// Loading textures
app.loader
.add('symbol1', 'cherry.png')
.add('symbol2', 'lemon.png')
.add('symbol3', 'grape.png')
.add('symbol4', 'watermelon.png')
.add('symbol5', 'goldBars.png')
.add('symbol6', 'diamond.png') 
.add('symbol7', 'wild.png')
.add('back', 'symbolBack.png')
.add('columns', 'columns.png')
.add('spinBttn', 'spinBttn.png')
.add('plus', 'plus.png')
.add('minus', 'minus.png')
.add('satchel', 'satchel.png')

app.loader.onProgress.add(showProgress);
app.loader.onComplete.add(doneLoading)

app.loader.load();

// Progress
function showProgress(e: { progress: any; }): void{
  console.log(e.progress);
}

// When loading is done:
function doneLoading(){
  let state: States = States.idle; // Setting state to idle

  // Initalizing textures
  initalizeTextures();

  // Creating new spin
  let s = new Spin(10, false);

  // Helpful variables
  let reelHeight: number = 0;
  let startingX: number = 0;
  let startingY: number = 0;
  let symbolWidth: number = 0;

  const speed: number = 70; // Speed of spin

  const blur = new PIXI.filters.BlurFilter; // New filter - blur
  blur.blurY = speed / 4;
  blur.blurX = 0;

  const gray = new PIXI.filters.ColorMatrixFilter;
  gray.desaturate();

  const maxIt: number = 150; // Max iterations in spin

  // Creating menu
  let menu: PIXI.Graphics = new PIXI.Graphics();
  menu.beginFill(0x000000);
  if(window.innerWidth > window.innerHeight){
    menu.drawRect(0, window.innerHeight - window.innerHeight / 4, window.innerWidth, window.innerHeight / 4);
  }else{
    menu.drawRect(0, window.innerHeight - window.innerHeight / 6, window.innerWidth, window.innerHeight / 6);
  }
  menu.alpha = 0.8;
  menu.endFill();

  // Creating button from texture
  let bttn = PIXI.Sprite.from(app.loader.resources['spinBttn'].texture);
  bttn.anchor.set(0.5, 0.5);
  if(window.innerWidth > window.innerHeight){
    bttn.width = bttn.height = menu.height * 3/5;
  }else{
    bttn.width = bttn.height = menu.height * 3/5;
  }
  bttn.position.x = window.innerWidth / 2;
  bttn.position.y = menu.getBounds().y + menu.getBounds().height / 2;
  bttn.interactive = true;



  // Creating text on menu - bet
  let bet = new PIXI.Text('10', 
  {
    fontFamily: 'Monoscape',
    fill: [0xffe000, 0xbfa800],
    fontSize: menu.height / 4,
    dropShadow: true,
    dropShadowBlur: 7,
    strokeThickness: 1
  })

  // Creating additional bar for balance
  let bar: PIXI.Graphics = new PIXI.Graphics();
  bar.beginFill(0x000000);
  bar.drawRect(0, window.innerHeight - menu.height / 6, window.innerWidth, menu.height / 6);
  bar.endFill();

  // Creating balance label
  let balanceLabel = new PIXI.Text('Balance: ', 
  {
    fontFamily: 'Monoscape',
    fill: [0xffffff, 0xd8d8d8],
    fontSize: bar.height * 2/3
  })
  balanceLabel.anchor.set(0.5, 0.5)
  balanceLabel.position.x = bar.width / 2 - balanceLabel.width / 2;
  balanceLabel.position.y = bar.getBounds().top + balanceLabel.height / 2;

  let balance = new PIXI.Text('10,000.00',
  {
    fontFamily: 'Monoscape',
    fill: [0xffffff, 0xd8d8d8],
    fontSize: bar.height * 2/3
  })
  balance.position.x = balanceLabel.getBounds().right;
  balance.anchor.set(0, 0.5)
  balance.position.y = bar.getBounds().top + balanceLabel.height / 2;

  // Win label
  let winLabel = new PIXI.Text('Win', 
  {
    fontFamily: 'Monoscape',
    fill: [0xffffff, 0xd8d8d8],
    fontSize: menu.height / 5
  })
  winLabel.anchor.set(0.5, 0.5);
  winLabel.position.x = window.innerWidth * 9/12;
  winLabel.position.y = menu.getBounds().y + menu.height / 2 - menu.height / 5;

  // Win text
  let win = new PIXI.Text('', 
  {
    fontFamily: 'Monoscape',
    fill: [0xffe000, 0xbfa800],
    fontSize: menu.height / 5
  })
  win.anchor.set(0.5);
  win.position.x = window.innerWidth * 9/12;
  win.position.y = menu.getBounds().y + menu.height / 2;

  // Text about win on lines
  let winInfo = new PIXI.Text('', 
  {
    fontFamily: 'Monoscape',
    fill: [0xffffff, 0xd8d8d8],
    fontSize: menu.height / 10,
    strokeThickness: 2
  })
  winInfo.anchor.set(0.5, 0.5);
  winInfo.position.x = bttn.getBounds().x + bttn.width / 2;
  winInfo.position.y = menu.getBounds().y + winInfo.height / 2;

  // Creating plus for increasing bet
  let plus = PIXI.Sprite.from(app.loader.resources['plus'].texture)
  plus.width = plus.height = bet.width / 2;
  plus.interactive = true;

  // Creating minus for decreasing bet
  let minus = PIXI.Sprite.from(app.loader.resources['minus'].texture)
  minus.width = minus.height = bet.width / 2;
  minus.interactive = true;

  // Setting postion for bet, +, -
  let betY = menu.getBounds().y + menu.getBounds().height / 2 - bet.height / 2;
  bet.position.y = betY;
  plus.position.y = betY + plus.width / 2
  minus.position.y = betY + minus.width / 2;

  if(window.innerWidth > window.innerHeight){
    minus.position.x = window.innerWidth / 6;
    bet.position.x = minus.position.x + minus.width * 2;
    plus.position.x = bet.position.x + bet.width + plus.width;
  }else{
    minus.position.x = 0 + minus.width;
    bet.position.x = minus.position.x + minus.width + minus.width / 2;
    plus.position.x = bet.position.x + bet.width + plus.width / 2;
  }

  let bottom: PIXI.Container = new PIXI.Container();
  bottom.addChild(menu, bttn, bet, bar, balanceLabel, balance, winLabel, win, winInfo, plus, minus)

  // Function to change balance
  function changeBalance(changeBy: number){
    bal = bal + changeBy;
    let balS: string = bal.toFixed(2); // String with 2 digits after the decimal point
    let balInt: string = bal.toFixed(0) // String with no digits after the decimal point
    let output: string = "";
    output = `.${balS[balS.length - 2]}${balS[balS.length - 1]}`;
    let j = 0
    for(let i = balInt.length - 1; i >= 0; i--){
      if(j % 3 == 0 && j != 0){
        output = `${balInt[i]},${output}`;
      }else{
        output = `${balInt[i]}${output}`;
      }
      j++;
    }
    balance.text = output;
  }

  // Ticker for spinning bttn animation
  const rotTicker = new PIXI.Ticker();
  rotTicker.add((delta) =>{
    bttn.angle += 30
  })

  // Events for button
  bttn.on('mousedown', function(e: any) {
    if(bal - stake < 0){
      return;
    }
    if(state == States.idle){
      rotTicker.start();
      changeBalance(-stake);
      spin(e);
    }else if(state == States.spinning){
      state = States.stopping;
    }else if(state == States.resultDone){
      bttn.texture = app.loader.resources['spinBttn'].texture;
      if(tWin > 0)
        changeBalance(tWin);
      win.text = "";
      winInfo.text = "";
      reels.forEach(reel => {
        reel.children.forEach(ch => {
          ch.filters = [];
        })
      })
      showLines.stop();
      state = States.idle;
    }
  });
  bttn.on('touchstart', function(e: any) {
    if(bal - stake < 0){
      return;
    }
    if(state == States.idle){
      rotTicker.start();
      changeBalance(-stake);
      spin(e);
    }else if(state == States.spinning){
      state = States.stopping;
    }else if(state == States.resultDone){
      bttn.texture = app.loader.resources['spinBttn'].texture;
      if(tWin > 0)
        changeBalance(tWin);
      win.text = "";
      winInfo.text = "";
      reels.forEach(reel => {
        reel.children.forEach(ch => {
          ch.filters = [];
        })
      })
      showLines.stop();
      state = States.idle;
    }
  });

  plus.on('mousedown', function(e: any) {
    if(bet.text == bets[bets.length - 1].toString()){
      return;
    }else{
      minus.filters = [];
      let temp: number = bets.indexOf(parseFloat(bet.text));
      let temp2: number = bets[temp + 1];
      bet.text = temp2.toString();
      stake = temp2;
      if(bets.indexOf(temp2) == bets.length - 1){
        plus.filters = [gray];
      }
    }   
  })
  plus.on('touchstart', function(e: any) {
    if(bet.text == bets[bets.length - 1].toString()){
      return;
    }else{
      minus.filters = [];
      let temp: number = bets.indexOf(parseFloat(bet.text));
      let temp2: number = bets[temp + 1];
      bet.text = temp2.toString();
      stake = temp2;
      if(bets.indexOf(temp2) == bets.length - 1){
        plus.filters = [gray];
      }
    }   
  })

  minus.on('mousedown', function(e: any) {
    if(bet.text == bets[0].toString()){
      return;
    }else{
      plus.filters = [];
      let temp: number = bets.indexOf(parseFloat(bet.text));
      let temp2: number = bets[temp - 1];
      bet.text = temp2.toString();
      stake = temp2;
      if(temp2 == bets[0]){
        minus.filters = [gray];
      }
    }    
  })
  minus.on('touchstart', function(e: any) {
    if(bet.text == bets[0].toString()){
      return;
    }else{
      plus.filters = [];
      let temp: number = bets.indexOf(parseFloat(bet.text));
      let temp2: number = bets[temp - 1];
      bet.text = temp2.toString();
      stake = temp2;
      if(temp2 == bets[0]){
        minus.filters = [gray];
      }
    }     
  })

  // Creating reel containers
  let reel1: PIXI.Container = new PIXI.Container();
  let reel2: PIXI.Container = new PIXI.Container();
  let reel3: PIXI.Container = new PIXI.Container();
  let reel4: PIXI.Container = new PIXI.Container();
  let reel5: PIXI.Container = new PIXI.Container(); 
  let reels: PIXI.Container[] = [reel1, reel2, reel3, reel4, reel5]; // Putting containers together
  let backReels: PIXI.Container = new PIXI.Container(); // Container containing sprites for reel backgrounds

  // Setting variables

  if(window.innerWidth > window.innerHeight){
    reelHeight = window.innerHeight - menu.getBounds().height;
    symbolWidth = reelHeight / 3;
    startingX = window.innerWidth / 2 - symbolWidth * 5 / 2;
  }else{
    symbolWidth = window.innerWidth / 5;
    reelHeight = symbolWidth * 3;
    if(window.innerHeight / 2 - reelHeight > 0){
      startingY = window.innerHeight / 2 - reelHeight;
    }else{
      startingY = 0;
    }
  }

  

  // Adding sprites for reels backgrounds
  for(let i = 0; i< 3; i++){
    for(let j = 0; j< 5; j++){
      let sprite = PIXI.Sprite.from(app.loader.resources['back'].texture);
      sprite.height = sprite.width = symbolWidth;
      if(window.innerWidth > window.innerHeight){
        sprite.position.y = symbolWidth * (i);
      }else{
        sprite.position.y = startingY + symbolWidth * (i);
      }
      sprite.position.x = startingX + symbolWidth * (j);
      backReels.addChild(sprite);
    }
  }

  // Showing spin result and adding symbols at top and bottom
  for(let i = -1; i < 4; i++){
    spritesNow[i+1] = []
    // Mask
    let mask = new PIXI.Graphics();
    mask.beginFill(0xFF3300);
    if(window.innerWidth > window.innerHeight){
      mask.drawRect(startingX + (i+1) * symbolWidth, 0, symbolWidth, reelHeight);
    }else{
      mask.drawRect(startingX + (i+1) * symbolWidth, startingY, symbolWidth, reelHeight);
    }
    
    mask.endFill();
    for(let j in reels){
      if(i == -1 || i == 3){
        let sprite = PIXI.Sprite.from(symbolChances.symbols[randomInt(0, 6)].texture);
        sprite.height = sprite.width = symbolWidth;
        if(window.innerWidth > window.innerHeight){
          sprite.position.y = symbolWidth * (i);
        }else{
          sprite.position.y = startingY + symbolWidth * (i);
        }
        spritesNow[i+1][j] = sprite;
        reels[j].addChild(sprite);
        
      }else{
        let sprite = PIXI.Sprite.from(s.spinResult[i][j].texture)
        sprite.height = sprite.width = symbolWidth;
        if(window.innerWidth > window.innerHeight){
          sprite.position.y = symbolWidth * (i);
        }else{
          sprite.position.y = startingY + symbolWidth * (i);
        }
        spritesNow[i+1][j] = sprite;
        reels[j].addChild(sprite);
      }
    }
    reels[i+1].mask = mask;
  }

  // Adding columns
  let columns = PIXI.Sprite.from(app.loader.resources['columns'].texture)
  columns.height = reelHeight + 1;
  columns.width = symbolWidth * 5;
  columns.position.x = startingX; 
  if(window.innerHeight > window.innerWidth){
    columns.position.y = startingY;
  }

  // Putting all together
  let slotCont = new PIXI.Container();

  // Setting positions of reels
  reel1.position.x = startingX; 
  reel2.position.x = startingX + symbolWidth;
  reel3.position.x = startingX + symbolWidth * 2;
  reel4.position.x = startingX + symbolWidth * 3;
  reel5.position.x = startingX + symbolWidth * 4;

  slotCont.addChild(backReels, reel1, reel2, reel3, reel4, reel5, columns)

  // Adding containers to stage
  app.stage.addChild(slotCont, bottom);
  
  // Show results function
  function showResults(result: Spin){
    showLines = new PIXI.Ticker();
    tWin = result.totalWin;
    state = States.resultDone;
    let copySOWf = [...result.symbolsOnWinning]; // Copy
    let winC = result.winningLines.filter((el) => {
      return el != null;
    })
    copySOWf = copySOWf.filter((el) => { // Delete empty elements
      return el != null;
    })

    let symbolsToHighlight: PIXI.DisplayObject[][] = [];
    let winningMessage: string[] = [];

    let start: number = 0;
    
    
    if(copySOWf.length > 0){
      for(let i = 0; i < copySOWf.length; i++){
        symbolsToHighlight[i] = [];
        inner:
        for(let j = start; j < 5; j++){
          if(result.symbolsOnWinning[j] != null){
            for(let q = 0; q < result.symbolsOnWinning[j]; q++){
              symbolsToHighlight[i].push(reels[q].children[slot.paylines[j][q]+1])
            }
          winningMessage.push(`Won ${result.winningLines[j]} on line ${j+1}`);
          start = j+1;
          break inner;
          }
        }
      }
      showLines.start();
      bttn.texture = app.loader.resources['satchel'].texture;
    }else{
      state = States.idle;
    }

    let time: number = 0;
    let ln: number = 0;
    let w: number = 0;
    
    showLines.add((delta) => {
      if(time >= 30 * copySOWf.length){
        if(time % 120 == 0){
          winInfo.text = winningMessage[ln]
          reels.forEach(reel =>{
            reel.children.forEach(ch => {
              if(ch == symbolsToHighlight[ln][reels.indexOf(reel)]){
                ch.filters = [];
              }else{
                ch.filters = [gray];
              }
            })
          })
          if(ln == symbolsToHighlight.length - 1){
            ln = 0;
          }else{
            ln++;
          }
        }
      }else{
        if(time % 30 == 0){
          w = w + winC[ln];
          win.text = (w).toString();
          reels.forEach(reel =>{
            reel.children.forEach(ch => {
              if(ch == symbolsToHighlight[ln][reels.indexOf(reel)]){
                ch.filters = [];
              }else{
                ch.filters = [gray];
              }
            })
          })
          if(ln == symbolsToHighlight.length - 1){
            ln = 0;
          }else{
            ln++;
          }
        }
      }
      time++;
    })
  }

  // Spin function
  function spin(e: any){
    if(state == States.idle){ // If is in idle
      sp = new Spin(stake, false); //Spin result

      spinAnimation(sp); // Running animation

      state = States.spinning; // Setting state to 'spinning'
    }
  }

  function spinAnimation(res: Spin){
    let n = 0; // Variable to timeout each reel so they don't run at same time

    reels.forEach(element => { // For each reel
      n++;
      setTimeout(() => {
        animateReel(element, reels.indexOf(element), res); // Reel animation
      }, 200 * n);
    })
  }

  function animateReel(reel: PIXI.Container, reelNumber: number, res: Spin){
    
    let it: number = 1; // Iteration
    if(state == States.spinning){
      it = 1;
    }else if(state == States.stopping || state == States.resultWaiting){
      it = maxIt;
    }
      

    let spinDone: boolean = false;

    let addNext = Math.round(symbolWidth / speed); //When to add next symbol

    let ticker = new PIXI.Ticker; //Ticker
    let sR = [...res.spinResult]; //Copy of array from Spin object

    // Function that adds symbol at top
    function addSymbolAtTop(){
      let temp = randomInt(0, 6); 

      let sprite = PIXI.Sprite.from(symbolChances.symbols[temp].texture); // Takes random texture to variable
      sprite.height = sprite.width = symbolWidth; // Setting height and width
      
      reel.removeChildAt(reel.children.length-1); // Removing last child of reel

      for(let m = reel.children.length-1; m <= 0; m--){ // Fixing indexes (making space at index 0)
        reel.setChildIndex(reel.children[m], m+1)
      }
      reel.addChildAt(sprite, 0).position.y = 0 - symbolWidth; // Adding child (sprite) at index 0
    }

    // Function to fix position of symbols
    function fixPosition(){
      for(let p = 0; p < reel.children.length; p++){
        if(window.innerWidth > window.innerHeight){
          reel.children[p].position.y = symbolWidth * (p-1);
        }else{
          reel.children[p].position.y = startingY + symbolWidth * (p-1);
        } 
      }
    }

    ticker.start(); //Starting ticker...
    ticker.add((delta) => { //Ticker function
      if(state == States.stopping){
        it = maxIt;
      }
      if(it % addNext === 0 && it > 30){ // Condition to add symbol on top
        if(it >= maxIt){ // If its after max iterations - we want to show spin result then
          if(sR.length != 0){ // If we still have symbols to show

            let sprite = PIXI.Sprite.from(sR[sR.length-1][reelNumber].texture); // Taking textures from spin result
            sprite.height = sprite.width = symbolWidth; // Setting height and width

            sR.splice(sR.length-1, 1); // Removing added symbol from array
            reel.removeChildAt(reel.children.length-1); // Removing last child of reel
            
            for(let m = reel.children.length-1; m <= 0; m--){ // Fixing indexes
              reel.setChildIndex(reel.children[m], m+1)
            }

            reel.addChildAt(sprite, 0).position.y = 0 - symbolWidth; // Adding created sprite to beggining of reel
          }else{ // If there's nothing else to add
            reel.filters = []; // Clearing filters

            ticker.stop(); // Stoping ticker
            state = States.resultWaiting; // Changing state to show result
            
            it = 0;

            addSymbolAtTop(); // Adding symbol at top
            fixPosition(); // Fixing position
            
            spinDone = true; // Saying to program that spin is done

            if(reelNumber == 4){
              rotTicker.stop();
              bttn.angle = 0;
              showResults(res)
            }
          }
        }else{ // If it's not after max iterations - random elements animation
          addSymbolAtTop(); // Adding symbol at top
        }
      }
      reel.children.forEach(element => { // For each children on current reel
        if(it < 25 && it < maxIt){ // First symbols go backward
          element.position.y -= (speed/100) * it;
        }else{
          if(!spinDone){ // If spin isn't done
            element.position.y += speed; // Moving symbols
            reel.filters = [blur]; //Blur to reel
          }   
        }
      })
      it++; // Iteration
    })
  }
}


// On resize
function resize() { 
  app.renderer.resize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resize);

resize();
