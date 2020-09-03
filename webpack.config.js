const path = require('path');

module.exports = {
    mode: "production",
    entry: './src/ts/spinCalc.ts', 
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    resolve:{
        extensions: ['.ts', '.js']
    },
};