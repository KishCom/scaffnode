const {GitRevisionPlugin} = require('git-revision-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

const isRunningDevMode = process.env.NODE_ENV === "dev";
const outputPath = path.resolve(__dirname, '../public/dist');

const webpacked = {
    mode: isRunningDevMode ? "development" : "production",
    devtool: isRunningDevMode ? "eval-source-map" : false,
    entry: './src/app.js',
    output: {
        filename: 'bundle.[contenthash].js',
        chunkFilename: '[name].[contenthash].bundle.js',
        path: outputPath
    },
    module: {
        rules: [
            // Handle SASS
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader, // We still save our CSS file and reference it in the template
                    //{loader: "style-loader"}, // ... however we could load it dynamically instead (comment line above, uncomment this line, and remove <link> in <head> of "views/base.html")
                    {
                        loader: "css-loader"
                    }, {
                        loader: "sass-loader", options: {
                            sourceMap: isRunningDevMode
                        }
                    }
                ]
            },
            // Handle Images
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [{loader: 'file-loader', options: {publicPath: "dist/"}}]
            },
            // Handle Fonts
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                type: 'asset/resource'
            },
            // Transpile JS
            {test: /\.js$/, exclude: /node_modules/, loader: "swc-loader"}
        ]
    },
    plugins: [
        new GitRevisionPlugin(),
        new webpack.BannerPlugin({
            banner: "scaffnode - [name] [git-revision-hash]", // the banner as string or function, it will be wrapped in a comment
            raw: false, // if true, banner will not be wrapped in a comment
            entryOnly: true, // if true, the banner will only be added to the entry chunks
            // test: string | RegExp | [string, RegExp], // Include all modules that pass test assertion.
            // include: string | RegExp | [string, RegExp], // Include all modules matching any of these conditions.
            // exclude: string | RegExp | [string, RegExp], // Exclude all modules matching any of these conditions.
        }),
        new MiniCssExtractPlugin({
            filename: "bundle.[contenthash].css",
            chunkFilename: "bundle.[contenthash].[id].css"
        }),
        new webpack.ProgressPlugin(),
        new CleanWebpackPlugin(),
    ],
    optimization: {
        runtimeChunk: "single"
    }
};
if (!isRunningDevMode){
    webpacked.optimization.minimizer = [new TerserPlugin()];
}

module.exports = webpacked;
