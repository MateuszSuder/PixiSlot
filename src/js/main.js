"use strict";
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
    let graphics = new PIXI.Graphics();
    graphics.beginFill(0x000000);
    graphics.drawCircle(70, window.innerHeight / 2, 40);
    graphics.endFill();
    graphics.interactive = true;
    graphics.on('mousedown', spin);
    initalizeTextures();
    let s = new Spin(10);
    let reel_width;
    let blur = new PIXI.filters.BlurFilter;
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
                sprite.height = window.innerHeight / 3;
                sprite.width = window.innerHeight / 3;
                sprite.position.y = (window.innerHeight / 3) * (i);
                reels[j].addChild(sprite);
            }
            else {
                let sprite = PIXI.Sprite.from(s.spinResult[i][j].texture);
                sprite.height = window.innerHeight / 3;
                sprite.width = window.innerHeight / 3;
                sprite.position.y = (window.innerHeight / 3) * (i);
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
    function spin() {
        spinAnimation();
    }
    function animateReel(reel) {
        let it = 0;
        app.ticker.add((delta) => {
            reel.children.forEach(element => {
                if (it < 25) {
                    element.position.y -= Math.sqrt(it);
                }
                else {
                    reel.filters = [blur];
                    element.position.y += 100;
                }
            });
            it++;
        });
    }
    function spinAnimation() {
        let n = 0;
        reels.forEach(element => {
            n++;
            setTimeout(function () {
                animateReel(element);
            }, 100 * n);
        });
    }
}
function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resize);
resize();
