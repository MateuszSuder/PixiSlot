
const slot = {
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
}

class SlotSymbol{
    constructor(n: string, t: PIXI.Texture, p: number [][]){
        this.name = n;
        this.payouts = p
        this.texture = t;
    }

    name: string;
    texture: PIXI.Texture;
    payouts: number[][]; //[ [3, 5] ] 3 x this symbol pays 5x bet
}


//Symbols declaration
let symbol1 = new SlotSymbol("symbol1", app.loader.resources["symbol1"].texture, [[],[],  [2, 0.5],   [3, 1.5],   [4, 5],     [5, 20] ]);
let symbol2 = new SlotSymbol("symbol2", app.loader.resources["symbol2"].texture, [[],[],  [],         [3, 2],     [4, 7.5],   [5, 30] ]);
let symbol3 = new SlotSymbol("symbol3", app.loader.resources["symbol3"].texture, [[],[],  [],         [3, 2],     [4, 7.5],   [5, 30] ]);
let symbol4 = new SlotSymbol("symbol4", app.loader.resources["symbol4"].texture, [[],[],  [],         [3, 5],     [4, 15],    [5, 50] ]);
let symbol5 = new SlotSymbol("symbol5", app.loader.resources["symbol5"].texture, [[],[],  [],         [3, 7.5],   [4, 20],    [5, 60] ]);
let symbol6 = new SlotSymbol("symbol6", app.loader.resources["symbol6"].texture, [[],[],  [],         [3, 10],    [4, 50],    [5, 100] ]);
let symbol7 = new SlotSymbol("symbol7", app.loader.resources["symbol7"].texture, [[],[],  [],         [],         [],         [5, 200] ]);

function initalizeTextures(): void{
    symbol1.texture = app.loader.resources["symbol1"].texture;
    symbol2.texture = app.loader.resources["symbol2"].texture;
    symbol3.texture = app.loader.resources["symbol3"].texture;
    symbol4.texture = app.loader.resources["symbol4"].texture;
    symbol5.texture = app.loader.resources["symbol5"].texture;
    symbol6.texture = app.loader.resources["symbol6"].texture;
    symbol7.texture = app.loader.resources["symbol7"].texture;
}

const symbolChances = { //Chances = number of each symbol in draw
    symbols:    [symbol1,    symbol2,    symbol3,    symbol4,    symbol5,    symbol6,    symbol7],
    chances:    [200,        150,        150,        100,        90,         60,         50     ],

    numberToSymbol(nr: number){
        let temp: number = 1;

        for(let i = 0; i < this.chances.length; i++){
            if(nr >= temp && nr < temp + this.chances[i]){
                return this.symbols[i];
            }else{
                temp += this.chances[i];
            }
        }
    }
}


class Spin{
    spinResult: SlotSymbol[][] = []; //Symbols put in two dimensional array, so its easier to read slot-like [row][reel]
    winningLines: number[] = []; //Index of winning line in array from slot.paylines. First index(0) = first line
    bet: number = 0;
    totalWin: number = 0;

    constructor(b: number, logs?: boolean){
        this.bet = b;
        this.spinResult = this.drawSymbols(),
        this.checkLines()
        if(logs){
            this.logs();
        }
    }

    drawSymbols(){
        let result: SlotSymbol[][] = [];
        for(let ro = 0; ro < slot.rows; ro++){
            result[ro] = [];
            for(let re = 0; re < slot.reels; re++){
                let temp = randomInt(1, symbolsAmount);
                let res = symbolChances.numberToSymbol(temp);
                if(res != undefined){
                    result[ro][re] = res;
                }else{
                    throw new Error(`Error drawing value res (${res}) is undefined`);
                }
            }
        }
        return result;
    }

    checkLines(){
        for(let i = 0; i < slot.paylines.length; i++){ //Index of payline
            let nowChecking: SlotSymbol[] = [];
            for(let j = 0; j < slot.paylines[i].length; j++){ //Index of actual field
                nowChecking[j] = this.spinResult[slot.paylines[i][j]][j]
            }
            this.winOnLine(nowChecking, i)
        }
        return new Promise(resolve => {
            resolve("Lines checked");
        })
    }

    winOnLine(line: SlotSymbol[], paylineNumber: number){
        let noWilds = line.filter(item => item != symbol7)
        if(noWilds.length == 0){
            this.winningLines[paylineNumber] = this.bet * symbol7.payouts[5][1];
        }else{
            let result: SlotSymbol[] = [];
            for(let el of line){
                if(el != noWilds[0] && el != symbol7){
                    break;
                }else{
                    result.push(el);
                }
            }
            if(noWilds[0] == symbol1 && result.length >= 2){
                this.winningLines[paylineNumber] = this.bet * symbol1.payouts[result.length][1];
            }else if(result.length >= 3){
                this.winningLines[paylineNumber] = this.bet * noWilds[0].payouts[result.length][1];
            }
        }
    }

    logs(){
        let r = "";
        for(let ro = 0; ro < slot.rows; ro++){
            for(let re = 0; re < slot.reels; re++){
                r += this.spinResult[ro][re].name + " ";
            }
            r += "\n"
        }
        console.log(this.spinResult)
        console.log(r);
        console.log(this.winningLines)
    }
}

function countSymbols(): number{
    let r: number = 0;
    for(let i = 0; i < symbolChances.chances.length; i++){
        r += symbolChances.chances[i];
    }
    return r;
}

const symbolsAmount = countSymbols();
