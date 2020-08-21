"use strict";
let sp;
var States;
(function (States) {
    States[States["idle"] = 0] = "idle";
    States[States["spinning"] = 1] = "spinning";
    States[States["result"] = 2] = "result";
})(States || (States = {}));
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
    .add('back', 'symbolBack.png');
app.loader.onProgress.add(showProgress);
app.loader.onComplete.add(doneLoading);
app.loader.load();
// Progress
function showProgress(e) {
    console.log(e.progress);
}
// When loading is done:
function doneLoading() {
    let state = States.idle; // Setting state to idle
    //Spin button for test
    let graphics = new PIXI.Graphics();
    graphics.beginFill(0x000000);
    graphics.drawCircle(70, window.innerHeight / 2, 40);
    graphics.endFill();
    graphics.interactive = true;
    // Events for button
    graphics.on('mousedown', function (e) {
        spin(e);
    });
    graphics.on('touchstart', function (e) {
        spin(e);
    });
    // Initalizing textures
    initalizeTextures();
    // Creating new spin
    let s = new Spin(10, true);
    // Helpful variables
    let reel_width = document.body.clientWidth / 3;
    let symbolWidth = document.body.clientHeight / 3;
    const speed = 70; // Speed of spin
    const blur = new PIXI.filters.BlurFilter; // New filter - blur
    blur.blurY = speed / 4;
    blur.blurX = 0;
    const maxIt = 100; // Max iterations in spin
    // Creating reel containers
    let reel1 = new PIXI.Container();
    let reel2 = new PIXI.Container();
    let reel3 = new PIXI.Container();
    let reel4 = new PIXI.Container();
    let reel5 = new PIXI.Container();
    let reels = [reel1, reel2, reel3, reel4, reel5]; // Putting containers together
    let backReels = new PIXI.Container(); // Container containing sprites for reel backgrounds
    // Adding sprites for reels backgrounds
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 5; j++) {
            let sprite = PIXI.Sprite.from(app.loader.resources['back'].texture);
            sprite.height = symbolWidth;
            sprite.width = symbolWidth;
            sprite.position.y = symbolWidth * (i);
            sprite.position.x = symbolWidth * (j);
            backReels.addChild(sprite);
        }
    }
    // Showing spin result and adding symbols at top and bottom
    for (let i = -1; i < 4; i++) {
        for (let j in reels) {
            if (i == -1 || i == 3) {
                let sprite = PIXI.Sprite.from(symbolChances.symbols[randomInt(0, 6)].texture);
                sprite.height = symbolWidth;
                sprite.width = symbolWidth;
                sprite.position.y = symbolWidth * (i);
                reels[j].addChild(sprite);
            }
            else {
                let sprite = PIXI.Sprite.from(s.spinResult[i][j].texture);
                sprite.height = symbolWidth;
                sprite.width = symbolWidth;
                sprite.position.y = symbolWidth * (i);
                reels[j].addChild(sprite);
            }
        }
    }
    // Setting positions of reels
    reel2.position.x = reel1.width;
    reel3.position.x = reel1.width + reel2.width;
    reel4.position.x = reel1.width + reel2.width + reel3.width;
    reel5.position.x = reel1.width + reel2.width + reel3.width + reel4.width;
    // Adding containers to stage
    app.stage.addChild(backReels, reel1, reel2, reel3, reel4, reel5, graphics);
    // Spin function
    function spin(e) {
        if (state == States.idle) { // If is in idle
            sp = new Spin(10, true); //Spin result
            spinAnimation(sp); // Running animation
            state = States.spinning; // Setting state to 'spinning'
        }
    }
    function spinAnimation(res) {
        let n = 0; // Variable to timeout each reel so they don't run at same time
        reels.forEach(element => {
            n++;
            setTimeout(() => {
                animateReel(element, reels.indexOf(element), res); // Reel animation
            }, 200 * n);
        });
    }
    function animateReel(reel, reelNumber, res) {
        let it = 1; //Iteration
        let spinDone = false;
        let addNext = Math.floor(symbolWidth / speed); //When to add next symbol
        let ticker = new PIXI.Ticker; //Ticker
        let sR = [...res.spinResult]; //Copy of array from Spin object
        // Function that adds symbol at top
        function addSymbolAtTop() {
            let temp = randomInt(0, 6);
            let sprite = PIXI.Sprite.from(symbolChances.symbols[temp].texture); // Takes random texture to variable
            sprite.height = sprite.width = symbolWidth; // Setting height and width
            reel.removeChildAt(reel.children.length - 1); // Removing last child of reel
            for (let m = reel.children.length - 1; m <= 0; m--) { // Fixing indexes (making space at index 0)
                reel.setChildIndex(reel.children[m], m + 1);
            }
            reel.addChildAt(sprite, 0).position.y = 0 - symbolWidth; // Adding child (sprite) at index 0
        }
        // Function to fix position of symbols
        function fixPosition() {
            for (let p = 0; p < reel.children.length; p++) {
                reel.children[p].position.y = symbolWidth * (p - 1);
            }
        }
        function testMask() {
            const m = new PIXI.Graphics();
            m.beginFill(0xFF3300);
            m.drawRect(0, 304, 5 * symbolWidth, 2 * symbolWidth);
            m.endFill();
            reel.mask = m;
        }
        ticker.start(); //Starting ticker...
        ticker.add((delta) => {
            if (it % addNext === 0 && it > 30) { // Condition to add symbol on top
                if (it >= maxIt) { // If its after max iterations - we want to show spin result then
                    if (sR.length != 0) { // If we still have symbols to show
                        let sprite = PIXI.Sprite.from(sR[sR.length - 1][reelNumber].texture); // Taking textures from spin result
                        sprite.height = sprite.width = symbolWidth; // Setting height and width
                        sR.splice(sR.length - 1, 1); // Removing added symbol from array
                        reel.removeChildAt(reel.children.length - 1); // Removing last child of reel
                        for (let m = reel.children.length - 1; m <= 0; m--) { // Fixing indexes
                            reel.setChildIndex(reel.children[m], m + 1);
                        }
                        reel.addChildAt(sprite, 0).position.y = 0 - symbolWidth; // Adding created sprite to beggining of reel
                    }
                    else { // If there's nothing else to add
                        reel.filters = []; // Clearing filters
                        ticker.stop(); // Stoping ticker
                        state = States.idle; // Changning state to idle
                        addSymbolAtTop(); // Adding symbol at top
                        fixPosition(); // Fixing position
                        spinDone = true; // Saying to program that spin is done
                    }
                }
                else { // If it's not after max iterations - random elements animation
                    addSymbolAtTop(); // Adding symbol at top
                }
            }
            reel.children.forEach(element => {
                if (it < 25 && it < maxIt) { // First symbols go backward
                    element.position.y -= (speed / 100) * it;
                }
                else {
                    if (!spinDone) { // If spin isn't dont
                        element.position.y += speed; // Moving symbols
                        reel.filters = [blur]; //Blur to reel
                    }
                }
            });
            it++; // Iteration
        });
    }
}
// On resize
function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resize);
resize();
