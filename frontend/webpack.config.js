const {GitRevisionPlugin} = require("git-revision-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const {CleanWebpackPlugin} = require("clean-webpack-plugin");
const SveltePreprocess = require("svelte-preprocess");
const Autoprefixer = require("autoprefixer");

const isRunningDevMode = process.env.NODE_ENV === "dev";
const outputPath = path.resolve(__dirname, "../public/dist");

const webpacked = {
    mode: isRunningDevMode ? "development" : "production",
    devtool: isRunningDevMode ? "eval-source-map" : false,
    entry: "./src/App.svelte",
    output: {
        filename: "bundle.[contenthash].js",
        chunkFilename: "[name].[contenthash].bundle.js",
        path: outputPath,
        publicPath: "/dist/",
        assetModuleFilename: "fonts/[name][ext]"
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
                    {loader: "sass-loader", options: {
                        sourceMap: isRunningDevMode,
                    }}]
            },
            // Handle Images
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [{loader: "file-loader", options: {publicPath: "dist/"}}]
            },
            // Handle Fonts
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                type: "asset"
            },
            // Transpile JS
            {test: /\.js$/, exclude: /node_modules/, loader: "swc-loader"},
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
                        hotOptions: {
                            // Prevent preserving local component state
                            preserveLocalState: false,
                            // If this string appears anywhere in your component's code, then local
                            // state won't be preserved, even when noPreserveState is false
                            noPreserveStateKey: "@!hmr",
                            // Prevent doing a full reload on next HMR update after fatal error
                            noReload: false,
                            // Try to recover after runtime errors in component init
                            optimistic: false,
                            // --- Advanced ---
                            // Prevent adding an HMR accept handler to components with
                            // accessors option to true, or to components with named exports
                            // (from <script context="module">). This have the effect of
                            // recreating the consumer of those components, instead of the
                            // component themselves, on HMR updates. This might be needed to
                            // reflect changes to accessors / named exports in the parents,
                            // depending on how you use them.
                            acceptAccessors: true,
                            acceptNamedExports: true,
                        },
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
                    fullySpecified: false,
                    conditionNames: ["svelte", "browser", "import"]
                }
            },
        ]
    },
    // leave off the extension when importing:
    resolve: {
        alias: {
            svelte: path.resolve("node_modules", "svelte/src/runtime"),
        },
        mainFields: ["svelte", "browser", "module", "main"],
        conditionNames: ["svelte", "browser", "import"],
        extensions: [".mjs", ".js", ".svelte", ".ts"],
    },
    plugins: [
        new GitRevisionPlugin(),
        new webpack.BannerPlugin({
            banner: "warden - [name]", // [git-revision-hash]", // the banner as string or function, it will be wrapped in a comment
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
    webpacked.optimization.minimizer = [new TerserPlugin()];
}

module.exports = webpacked;
