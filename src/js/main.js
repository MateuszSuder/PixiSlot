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
    let container = new PIXI.Container();
    for (let i = 1; i <= 7; i++) {
        let sprite = PIXI.Sprite.from(app.loader.resources['symbol' + i].texture);
        container.addChild(sprite);
    }
    app.stage.addChild(container);
    initalize();
}
window.addEventListener('resize', resize);
function resize() {
    app.renderer.resize(window.innerWidth, window.innerHeight);
}
resize();
