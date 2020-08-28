let sp: Spin;
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
  result,
  stopping
}

// Creating Pixi app
const app = new PIXI.Application({ 
  backgroundColor: 0x1099bb
});

document.body.appendChild(app.view);

app.loader.baseUrl = 'src/img/';

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
.add('test', 'test.png')
.add('plus', 'plus.png')
.add('minus', 'minus.png')

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
  let s = new Spin(10, true);

  // Helpful variables
  let reel_width: number = document.body.clientWidth / 3;
  let reelHeight: number;
  let startingX: number;
  let symbolWidth = document.body.clientHeight / 3;

  const speed: number = 70; // Speed of spin

  const blur = new PIXI.filters.BlurFilter; // New filter - blur
  blur.blurY = speed / 4;
  blur.blurX = 0;

  const grey = new PIXI.filters.ColorMatrixFilter;
  grey.desaturate();

  const maxIt: number = 150; // Max iterations in spin

  // Creating menu
  let menu: PIXI.Graphics = new PIXI.Graphics();
  menu.beginFill(0x000000);
  menu.drawRect(0, document.body.clientHeight - document.body.clientHeight / 4, document.body.clientWidth, document.body.clientHeight / 4);
  menu.alpha = 0.8;
  menu.endFill();

  // Creating button from texture
  let bttn = PIXI.Sprite.from(app.loader.resources['spinBttn'].texture);
  bttn.width = bttn.height = menu.height * 3/5;
  bttn.position.x = document.body.clientWidth / 2 - bttn.width/2;
  bttn.position.y = menu.getBounds().y + menu.getBounds().height / 2 - bttn.width / 2;
  bttn.interactive = true;

  // Creating text on menu - bet
  let bet = new PIXI.Text('10', {fontFamily: 'Monoscape', fill: [0xffe000, 0xbfa800],fontSize: menu.height / 3, dropShadow: true, dropShadowBlur: 7, strokeThickness: 1})

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

  minus.position.x = document.body.clientWidth / 6;
  bet.position.x = minus.position.x + minus.width * 2;
  plus.position.x = bet.position.x + bet.width + plus.width;

  // Events for button
  bttn.on('mousedown', function(e: any) {
    if(state == States.idle){
      spin(e);
    }else if(state == States.spinning){
      state = States.stopping;
    }
  });
  bttn.on('touchstart', function(e: any) {
    if(state == States.idle){
      spin(e);
    }else if(state == States.spinning){
      state = States.stopping;
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
      if(bets.indexOf(temp2) == bets.length - 1){
        plus.filters = [grey];
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
      if(bets.indexOf(temp2) == bets.length - 1){
        plus.filters = [grey];
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
      if(temp2 == bets[0]){
        minus.filters = [grey];
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
      if(temp2 == bets[0]){
        minus.filters = [grey];
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
  reelHeight = document.body.clientHeight - menu.getBounds().height;
  symbolWidth = reelHeight / 3;
  startingX = document.body.clientWidth / 2 - symbolWidth * 5 / 2;

  // Adding sprites for reels backgrounds
  for(let i = 0; i< 3; i++){
    for(let j = 0; j< 5; j++){
      let sprite = PIXI.Sprite.from(app.loader.resources['back'].texture);
      sprite.height = sprite.width = symbolWidth;
      sprite.position.y = symbolWidth * (i);
      sprite.position.x = startingX + symbolWidth * (j);

      backReels.addChild(sprite);
    }
  }

  // Showing spin result and adding symbols at top and bottom
  for(let i = -1; i < 4; i++){
    // Mask
    let mask = new PIXI.Graphics();
    mask.beginFill(0xFF3300);
    mask.drawRect(startingX + (i+1) * symbolWidth, 0, symbolWidth, reelHeight);
    mask.endFill();
    for(let j in reels){
      if(i == -1 || i == 3){
        let sprite = PIXI.Sprite.from(symbolChances.symbols[randomInt(0, 6)].texture);
        sprite.height = symbolWidth;
        sprite.width = symbolWidth;
        sprite.position.y = symbolWidth * (i);
        
        reels[j].addChild(sprite);
        
      }else{
        let sprite = PIXI.Sprite.from(s.spinResult[i][j].texture)
        sprite.height = symbolWidth;
        sprite.width = symbolWidth;
        sprite.position.y = symbolWidth * (i);

        reels[j].addChild(sprite);
      }
    }
    reels[i+1].mask = mask;
  }

  // Setting positions of reels
  reel1.position.x = startingX; 
  reel2.position.x = startingX + symbolWidth;
  reel3.position.x = startingX + symbolWidth * 2;
  reel4.position.x = startingX + symbolWidth * 3;
  reel5.position.x = startingX + symbolWidth * 4;

  // Adding columns
  let columns = PIXI.Sprite.from(app.loader.resources['columns'].texture)
  columns.height = reelHeight;
  columns.width = symbolWidth * 5;
  columns.position.x = startingX; 

  // Adding containers to stage
  app.stage.addChild(backReels, reel1, reel2, reel3, reel4, reel5, columns, menu, bttn, bet, plus, minus);

  // Spin function
  function spin(e: any){
    if(state == States.idle){ // If is in idle
      sp = new Spin(10, true); //Spin result

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
    }else if(state == States.stopping || state == States.result){
      it = maxIt;
    }
      

    let spinDone: boolean = false;

    let addNext = Math.floor(symbolWidth / speed); //When to add next symbol

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
        reel.children[p].position.y = symbolWidth * (p-1);
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
            state = States.result; // Changning state to idle

            it = 0;

            addSymbolAtTop(); // Adding symbol at top
            fixPosition(); // Fixing position
            
            spinDone = true; // Saying to program that spin is done
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