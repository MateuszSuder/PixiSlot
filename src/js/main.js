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
    initalizeTextures();
    let s = new Spin(10);
    console.log(s.spinResult[0][0]);
    let reel1 = new PIXI.Container();
    let reel2 = new PIXI.Container();
    let reel3 = new PIXI.Container();
    let reel4 = new PIXI.Container();
    let reel5 = new PIXI.Container();
    for (let i = 0; i < 3; i++) {
        let sprite = PIXI.Sprite.from(s.spinResult[i][0].texture);
        sprite.height = window.innerHeight / 3;
        sprite.width = window.innerHeight / 3;
        sprite.position.y = (window.innerHeight / 3) * (i);
        reel1.addChild(sprite);
    }
    for (let i = 0; i < 3; i++) {
        let sprite = PIXI.Sprite.from(s.spinResult[i][1].texture);
        sprite.height = window.innerHeight / 3;
        sprite.width = window.innerHeight / 3;
        sprite.position.y = (window.innerHeight / 3) * (i);
        reel2.addChild(sprite);
    }
    for (let i = 0; i < 3; i++) {
        let sprite = PIXI.Sprite.from(s.spinResult[i][2].texture);
        sprite.height = window.innerHeight / 3;
        sprite.width = window.innerHeight / 3;
        sprite.position.y = (window.innerHeight / 3) * (i);
        reel3.addChild(sprite);
    }
    for (let i = 0; i < 3; i++) {
        let sprite = PIXI.Sprite.from(s.spinResult[i][3].texture);
        sprite.height = window.innerHeight / 3;
        sprite.width = window.innerHeight / 3;
        sprite.position.y = (window.innerHeight / 3) * (i);
        reel4.addChild(sprite);
    }
    for (let i = 0; i < 3; i++) {
        let sprite = PIXI.Sprite.from(s.spinResult[i][4].texture);
        sprite.height = window.innerHeight / 3;
        sprite.width = window.innerHeight / 3;
        sprite.position.y = (window.innerHeight / 3) * (i);
        reel5.addChild(sprite);
    }
    reel2.position.x = reel1.width;
    reel3.position.x = reel1.width + reel2.width;
    reel4.position.x = reel1.width + reel2.width + reel3.width;
    reel5.position.x = reel1.width + reel2.width + reel3.width + reel4.width;
    app.stage.addChild(reel1, reel2, reel3, reel4, reel5);
}
function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', resize);
resize();
