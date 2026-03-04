const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const SveltePreprocess = require("svelte-preprocess");
const Autoprefixer = require("autoprefixer");

const isRunningDevMode = process.env.NODE_ENV === "dev";

const srcPath = "../public/dist";
const entryPoint = "./src/index.js";
const publicPath = "dist/";

const outputPath = path.resolve(__dirname, srcPath);

const webpacked = {
    mode: isRunningDevMode ? "development" : "production",
    devtool: "source-map",
    entry: entryPoint,
    output: {
        filename: "bundle.[contenthash].js",
        chunkFilename: "[name].[contenthash].bundle.js",
        path: outputPath,
        publicPath: "/dist/",
    },
    module: {
        rules: [
            // Handle SASS
            {
                test: /\.s?css$/,
                use: [
                    MiniCssExtractPlugin.loader, // We still save our CSS file and reference it in the template
                    //{loader: "style-loader"}, // ... however we could load it dynamically instead (comment line above, uncomment this line, and remove <link> in <head> of "views/base.html")
                    {loader: "css-loader"},
                    {loader: "sass-loader", options: {sourceMap: isRunningDevMode}}]
            },
            // Handle Images and sounds
            {
                test: /\.(png|svg|jpg|gif|wav|mp3)$/,
                use: [{loader: "file-loader", options: {publicPath}}]
            },
            // Handle Fonts
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                type: "asset/resource",
            },
            // Transpile JS
            {test: /\.js$/, exclude: /node_modules/, loader: "swc-loader",  options: {
                "sourceMaps": true,
                "inlineSourcesContent": true
            }},
            {
                test: /\.glsl$/,
                type: 'asset/source'
            },
            // Svelte
            {test: /\.svelte$/,
                use: {
                    loader: "svelte-loader",
                    options: {
                        compilerOptions: {
                            // Dev mode must be enabled for HMR to work!
                            dev: isRunningDevMode,
                        },
                        emitCss: true,
                        hotReload: isRunningDevMode,
                        preprocess: SveltePreprocess({
                            scss: true,
                            sass: true,
                            postcss: {plugins: [Autoprefixer]}
                        })
                    }
                }
            },

            // Required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
            // See: https://github.com/sveltejs/svelte-loader#usage
            {
                test: /node_modules\/svelte\/.*\.mjs$/,
                resolve: {
                    fullySpecified: false
                }
            },
            // Fix for third-party packages with module resolution issues in Svelte 5
            {
                test: /node_modules\/.*\.js$/,
                resolve: {
                    fullySpecified: false
                }
            },
        ]
    },
    // leave off the extension when importing:
    resolve: {
        alias: {
            "lodash-es": "lodash"
        },
        mainFields: ["svelte", "browser", "module", "main"],
        conditionNames: ["svelte", "browser", "import"],
        extensions: [".mjs", ".js", ".svelte", ".ts"],
        fullySpecified: false
    },
    plugins: [
        //new GitRevisionPlugin(),
        new webpack.BannerPlugin({
            banner: "scaffnode - [name]", // [git-revision-hash]", // the banner as string or function, it will be wrapped in a comment
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
        new webpack.HotModuleReplacementPlugin(),
        new CleanWebpackPlugin(),
    ],
    optimization: {
        runtimeChunk: "single"
    }
};
if (!isRunningDevMode){
    webpacked.optimization.minimizer = [new TerserPlugin({terserOptions: {
        compress: true,
        mangle: true,
        sourceMap: true,
    }})];
}

module.exports = webpacked;
