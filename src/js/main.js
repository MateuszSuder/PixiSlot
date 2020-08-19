"use strict";
let sp;
var States;
(function (States) {
    States[States["idle"] = 0] = "idle";
    States[States["spinning"] = 1] = "spinning";
    States[States["result"] = 2] = "result";
})(States || (States = {}));
const app = new PIXI.Application({
    backgroundColor: 0x1099bb
});
document.body.appendChild(app.view);
app.loader.baseUrl = 'src/img/';
app.loader
    .add('symbol1', '1.png')
    .add('symbol2', '2.png')
    .add('symbol3', '3.png')
    .add('symbol4', '4.png')
    .add('symbol5', '5.png')
    .add('symbol6', '6.png')
    .add('symbol7', '7.png');
app.loader.onProgress.add(showProgress);
app.loader.onComplete.add(doneLoading);
app.loader.load();
function showProgress(e) {
    console.log(e.progress);
}
function doneLoading() {
    console.time();
    let state = States.idle;
    let graphics = new PIXI.Graphics();
    graphics.beginFill(0x000000);
    graphics.drawCircle(70, window.innerHeight / 2, 40);
    graphics.endFill();
    graphics.interactive = true;
    graphics.on('mousedown', function (e) {
        spin(e);
    });
    graphics.on('touchstart', function (e) {
        spin(e);
    });
    initalizeTextures();
    let s = new Spin(10, true);
    let reel_width = document.body.clientWidth / 5;
    let symbolWidth = document.body.clientHeight / 3;
    const speed = 70;
    const blur = new PIXI.filters.BlurFilter;
    blur.blurY = speed;
    const maxIt = 100;
    let reel1 = new PIXI.Container();
    let reel2 = new PIXI.Container();
    let reel3 = new PIXI.Container();
    let reel4 = new PIXI.Container();
    let reel5 = new PIXI.Container();
    let reels = [reel1, reel2, reel3, reel4, reel5];
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
    reel2.position.x = reel1.width;
    reel3.position.x = reel1.width + reel2.width;
    reel4.position.x = reel1.width + reel2.width + reel3.width;
    reel5.position.x = reel1.width + reel2.width + reel3.width + reel4.width;
    app.stage.addChild(reel1, reel2, reel3, reel4, reel5, graphics);
    console.timeEnd();
    function spin(e) {
        if (state == States.idle) {
            sp = new Spin(10, true); //Spin result
            spinAnimation(sp);
            state = States.spinning;
        }
    }
    function spinAnimation(res) {
        let n = 0;
        reels.forEach(element => {
            n++;
            setTimeout(() => {
                animateReel(element, reels.indexOf(element), res);
            }, 200 * n);
        });
    }
    function animateReel(reel, reelNumber, res) {
        let it = 1; //Iteration
        let spinDone = false;
        let addNext = Math.floor(symbolWidth / speed); //When to add next symbol
        let ticker = new PIXI.Ticker; //Ticker
        let sR = [...res.spinResult]; //Copy of array from Spin object
        function addSymbolAtTop() {
            let temp = randomInt(0, 6);
            let sprite = PIXI.Sprite.from(symbolChances.symbols[temp].texture);
            sprite.height = sprite.width = symbolWidth;
            reel.removeChildAt(reel.children.length - 1);
            for (let m = reel.children.length - 1; m <= 0; m--) {
                reel.setChildIndex(reel.children[m], m + 1);
            }
            reel.addChildAt(sprite, 0).position.y = 0 - symbolWidth;
        }
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
            if (it % addNext === 0 && it > 30) {
                if (it >= maxIt) {
                    if (sR.length != 0) {
                        let sprite = PIXI.Sprite.from(sR[sR.length - 1][reelNumber].texture);
                        sprite.height = sprite.width = symbolWidth;
                        sR.splice(sR.length - 1, 1);
                        reel.removeChildAt(reel.children.length - 1);
                        for (let m = reel.children.length - 1; m <= 0; m--) {
                            reel.setChildIndex(reel.children[m], m + 1);
                        }
                        reel.addChildAt(sprite, 0).position.y = 0 - symbolWidth;
                    }
                    else {
                        reel.filters = [];
                        ticker.stop();
                        state = States.idle;
                        addSymbolAtTop();
                        fixPosition();
                        spinDone = true;
                    }
                }
                else {
                    addSymbolAtTop();
                }
            }
            reel.children.forEach(element => {
                if (it < 25 && it < maxIt) {
                    element.position.y -= (speed / 100) * it;
                }
                else {
                    if (!spinDone) {
                        element.position.y += speed;
                        reel.filters = [blur]; //Blur to reel
                    }
                }
            });
            it++;
        });
    }
}
function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resize);
resize();
