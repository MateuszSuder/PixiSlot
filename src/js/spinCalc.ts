const slot = {
    reels: 5,
    rows: 3,
    //0 - 0 - 0 - 0 - 0
    //1 - 1 - 1 - 1 - 1
    //2 - 2 - 2 - 2 - 2
    paylines: [
        [0,0,0,0,0],
        [1,1,1,1,1],
        [2,2,2,2,2],
        [0,1,2,1,0],
        [2,1,0,1,2],
    ],
}

class SlotSymbol{
    constructor(n: string, t: PIXI.Texture, p: number [][]){
        this.name = n;
        this.texture = t;
        this.payouts = p;
    }
    name: string;
    texture: PIXI.Texture;
    payouts: number[][]; //[ [3, 5] ] 3 x this symbol pays 5x bet
}

function initalize(){
    class Spin{
        spinResult: number[][] = []; //Symbols put in two dimensional array, so its easier to read slot-like [row][reel]
        winningLines: number[] = []; //Number of line in array from slot.paylines
        bet: number;
        totalWin: number = 0;
    
        constructor(b: number, logs?: boolean){
            this.bet = b;
        }
    
        drawSymbols(){
            
        }
    
    }

    //Symbols declaration
    const symbol1 = new SlotSymbol("symbol1", app.loader.resources["symbol1"].texture, [ [2, 0.5],  [3, 1.5],   [4, 5],     [5, 20] ]);
    const symbol2 = new SlotSymbol("symbol2", app.loader.resources["symbol2"].texture, [            [3, 2],     [4, 7.5],   [5, 30] ]);
    const symbol3 = new SlotSymbol("symbol3", app.loader.resources["symbol3"].texture, [            [3, 2],     [4, 7.5],   [5, 30] ]);
    const symbol4 = new SlotSymbol("symbol4", app.loader.resources["symbol4"].texture, [            [3, 5],     [4, 15],    [5, 50] ]);
    const symbol5 = new SlotSymbol("symbol5", app.loader.resources["symbol5"].texture, [            [3, 7.5],   [4, 20],    [5, 60] ]);
    const symbol6 = new SlotSymbol("symbol6", app.loader.resources["symbol6"].texture, [            [3, 10],    [4, 50],    [5, 100] ]);
    const symbol7 = new SlotSymbol("symbol7", app.loader.resources["symbol7"].texture, [            [3, 20],    [4, 100],   [5, 200] ]);

    const symbolChances = { //Chances = number of each symbol in draw
        symbols:    [symbol1,    symbol2,    symbol3,    symbol4,    symbol5,    symbol6,    symbol7],
        chances:    [200,        150,        150,        100,        90,         60,         50     ]
    }

    function countSymbols(): number{
        let r: number = 0;
        for(let i = 0; i < symbolChances.chances.length; i++){
            r += symbolChances.chances[i];
        }
        return r;
    }

    const symbolsAmount = countSymbols();

}

