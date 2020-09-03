import { randomInt } from './functions';
import { app } from './main';
export var slot = {
    reels: 5,
    rows: 3,
    //0 - 0 - 0 - 0 - 0
    //1 - 1 - 1 - 1 - 1
    //2 - 2 - 2 - 2 - 2
    paylines: [
        [0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2],
        [0, 1, 2, 1, 0],
        [2, 1, 0, 1, 2],
    ],
    RTP: "98,64%"
};
var SlotSymbol = /** @class */ (function () {
    function SlotSymbol(n, t, p) {
        this.name = n;
        this.payouts = p;
        this.texture = t;
    }
    return SlotSymbol;
}());
//Symbols declaration
var symbol1 = new SlotSymbol("symbol1", app.loader.resources["symbol1"].texture, [[], [], [2, 0.5], [3, 1], [4, 2.5], [5, 5]]);
var symbol2 = new SlotSymbol("symbol2", app.loader.resources["symbol2"].texture, [[], [], [], [3, 1], [4, 2.5], [5, 5]]);
var symbol3 = new SlotSymbol("symbol3", app.loader.resources["symbol3"].texture, [[], [], [], [3, 2], [4, 3], [5, 10]]);
var symbol4 = new SlotSymbol("symbol4", app.loader.resources["symbol4"].texture, [[], [], [], [3, 5], [4, 10], [5, 28.5]]);
var symbol5 = new SlotSymbol("symbol5", app.loader.resources["symbol5"].texture, [[], [], [], [3, 10], [4, 22.5], [5, 65]]);
var symbol6 = new SlotSymbol("symbol6", app.loader.resources["symbol6"].texture, [[], [], [], [3, 25], [4, 50], [5, 125]]);
var symbol7 = new SlotSymbol("symbol7", app.loader.resources["symbol7"].texture, [[], [], [], [], [], [5, 500]]);
export function initalizeTextures() {
    symbol1.texture = app.loader.resources["symbol1"].texture;
    symbol2.texture = app.loader.resources["symbol2"].texture;
    symbol3.texture = app.loader.resources["symbol3"].texture;
    symbol4.texture = app.loader.resources["symbol4"].texture;
    symbol5.texture = app.loader.resources["symbol5"].texture;
    symbol6.texture = app.loader.resources["symbol6"].texture;
    symbol7.texture = app.loader.resources["symbol7"].texture;
}
export var symbolChances = {
    symbols: [symbol1, symbol2, symbol3, symbol4, symbol5, symbol6, symbol7],
    chances: [250, 250, 205, 125, 80, 67, 33],
    numberToSymbol: function (nr) {
        var temp = 1;
        for (var i = 0; i < this.chances.length; i++) {
            if (nr >= temp && nr < temp + this.chances[i]) {
                return this.symbols[i];
            }
            else {
                temp += this.chances[i];
            }
        }
    }
};
function RTPcalc(nrSpins) {
    var spins = 0;
    var hw = 0;
    var highestWin = "";
    var balance = 1000000;
    var bet = 10;
    for (var i = 1; i <= nrSpins; i++) {
        if (i % (nrSpins / 100) == 0) {
            console.clear();
            console.log((i / nrSpins * 100).toFixed(2) + "%");
        }
        var temp = new Spin(bet, false);
        balance = balance - bet;
        if (temp.totalWin > hw) {
            highestWin = "Highest win was " + temp.totalWin / bet + "x at spin number " + i + ".";
            hw = temp.totalWin;
        }
        if (temp.totalWin > 0) {
            balance = balance + temp.totalWin;
        }
        spins++;
    }
    console.log("Done " + spins + " spins with bet " + bet + ". \n" + highestWin + " \nBalance at end is " + balance + ".\nThat means RTP is " + balance / 10000 + "%");
}
var Spin = /** @class */ (function () {
    function Spin(b, logs) {
        this.spinResult = []; //Symbols put in two dimensional array, so its easier to read slot-like [row][reel]
        this.winningLines = []; //Index of winning line in array from slot.paylines. First index(0) = first line
        this.bet = 0;
        this.totalWin = 0;
        this.symbolsOnWinning = [];
        this.bet = b;
        this.spinResult = this.drawSymbols(),
            this.checkLines();
        this.winCalc();
        if (logs) {
            this.logs();
        }
    }
    Spin.prototype.winCalc = function () {
        for (var _i = 0, _a = this.winningLines; _i < _a.length; _i++) {
            var i = _a[_i];
            if (i > 0)
                this.totalWin += i;
        }
    };
    Spin.prototype.drawSymbols = function () {
        var result = [];
        for (var ro = 0; ro < slot.rows; ro++) {
            result[ro] = [];
            for (var re = 0; re < slot.reels; re++) {
                var temp = randomInt(1, symbolsAmount);
                var res = symbolChances.numberToSymbol(temp);
                if (res != undefined) {
                    result[ro][re] = res;
                }
                else {
                    throw new Error("Error drawing value res (" + res + ") is undefined");
                }
            }
        }
        return result;
    };
    Spin.prototype.checkLines = function () {
        for (var i = 0; i < slot.paylines.length; i++) { //Index of payline
            var nowChecking = [];
            for (var j = 0; j < slot.paylines[i].length; j++) { //Index of actual field
                nowChecking[j] = this.spinResult[slot.paylines[i][j]][j];
            }
            this.winOnLine(nowChecking, i);
        }
    };
    Spin.prototype.winOnLine = function (line, paylineNumber) {
        var noWilds = line.filter(function (item) { return item != symbol7; });
        if (noWilds.length == 0) {
            this.winningLines[paylineNumber] = this.bet * symbol7.payouts[5][1];
            this.symbolsOnWinning[paylineNumber] = 5;
        }
        else {
            var result = [];
            for (var _i = 0, line_1 = line; _i < line_1.length; _i++) {
                var el = line_1[_i];
                if (el != noWilds[0] && el != symbol7) {
                    break;
                }
                else {
                    result.push(el);
                }
            }
            if (noWilds[0] == symbol1 && result.length >= 2) {
                this.winningLines[paylineNumber] = this.bet * symbol1.payouts[result.length][1];
                this.symbolsOnWinning[paylineNumber] = result.length;
            }
            else if (result.length >= 3) {
                this.winningLines[paylineNumber] = this.bet * noWilds[0].payouts[result.length][1];
                this.symbolsOnWinning[paylineNumber] = result.length;
            }
        }
    };
    Spin.prototype.logs = function () {
        var r = "";
        for (var ro = 0; ro < slot.rows; ro++) {
            for (var re = 0; re < slot.reels; re++) {
                r += this.spinResult[ro][re].name + " ";
            }
            r += "\n";
        }
        console.log(this.spinResult);
        console.log(r);
        console.log(this.winningLines);
    };
    return Spin;
}());
export { Spin };
function countSymbols() {
    var r = 0;
    for (var i = 0; i < symbolChances.chances.length; i++) {
        r += symbolChances.chances[i];
    }
    return r;
}
var symbolsAmount = countSymbols();
