// output.pathに絶対パスを指定する必要があるため、pathモジュールを読み込んでおく
const path = require('path');

const ROOT_DIR = path.join(__dirname, 'resources');
const NODE_DIR = path.join(__dirname, 'node_modules');

const SCRIPTS_DIR = path.join(ROOT_DIR, 'scripts');
const STYLES_DIR = path.join(ROOT_DIR, 'styles');

const BUILD_DIR = path.join(__dirname, 'public/build');
const ASSET_PATH = '/assets/';

module.exports = {
    // モードの設定、v4系以降はmodeを指定しないと、webpack実行時に警告が出る
    mode: 'production',
    // エントリーポイントの設定
    entry: [
        path.join(STYLES_DIR, 'entry.scss'),
        path.join(SCRIPTS_DIR, 'entry.js'),
    ],
    // entry: ENTRY_PATH,
    // 出力の設定
    output: {
        // The folder to output the production bundle
        path: BUILD_DIR,
        // The name of the bundle, used by both production and development
        filename: 'scripts/bundle.js',
        // The path where the bundle assets will be served from (also informs
        // webpack-dev-server where to serve from)
        publicPath: ASSET_PATH,
    },
    module: {
        rules: [
            {
                test: /\.js(x)$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    babelrc: false,
                    presets: [
                        '@babel/preset-env',
                        '@babel/preset-react'
                    ],
                    plugins: [
                        ['@babel/plugin-proposal-class-properties', {
                            loose: true
                        }]
                    ]
                }
            },
            {
                // Process SASS -> CSS and then extract into separate file
                test: /\.scss$/,
                loader: 'style-loader!css-loader!sass-loader',
                include: STYLES_DIR,
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader!sass-loader',
                include: NODE_DIR,
            },
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.scss', '.css'],
        alias: {
            styles: STYLES_DIR,
            scripts: SCRIPTS_DIR,
            node: NODE_DIR,
        },
    },
    plugins: []
};
