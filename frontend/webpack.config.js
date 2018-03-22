const path = require('path');
const webpackGitBanner = require('./webpackGitBannerPlugin.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');

const isRunningDevMode = process.env.NODE_ENV === "dev";
const outputPath = path.resolve(__dirname, '../public/dist');

const webpacked = {
    mode: isRunningDevMode ? "development" : "production",
    devtool: isRunningDevMode ? "eval-source-map" : false,
    entry: './src/app.js',
    output: {
        filename: 'bundle.[hash].js',
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
                        loader: "css-loader",
                        options: {
                            sourceMap: isRunningDevMode,
                            minimize: true
                        }
                    }, {
                        loader: "sass-loader", options: {
                            sourceMap: isRunningDevMode,
                            data: `$NODE_ENV: ${process.env.NODE_ENV || "not-set"};`,
                            includePaths: ["node_modules/bootstrap/scss"]
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
                use: [{loader: 'file-loader'}]
            },
            // Transpile JS
            {test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
    },
    plugins: [
        new webpackGitBanner("scaffnode tool chain"),
        new MiniCssExtractPlugin({
            filename: "bundle.[hash].css",
            chunkFilename: "bundle.[hash].[id].css"
        }),
        new CleanWebpackPlugin([outputPath], {allowExternal: true}),
    ]
};
if (!isRunningDevMode){
    webpacked.plugins.push(new UglifyJSPlugin());
}

module.exports = webpacked;
