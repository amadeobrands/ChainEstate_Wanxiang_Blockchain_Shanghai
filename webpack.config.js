const path = require('path');
const copyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './chain-estate/dashboard/main.js',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js'
    },
    plugins: [
        new copyPlugin([
            { from: './chain-estate' }
        ])
    ],
    module: {
        rules: [
            { 
                test: /\.css$/, 
                loaders: ['style-loader', 'css-loader'] 
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                loader: 'babel-loader',
                query: {
                    presets: ['env'],
                    plugins: ['transform-runtime']
                }
            }

        ]
    }
}
