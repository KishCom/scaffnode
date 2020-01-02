const ConcatSource = require("webpack-sources").ConcatSource;
const ModuleFilenameHelpers = require("webpack").ModuleFilenameHelpers;
const Template = require("webpack").Template;
var execBash = require('child_process').exec;
const validateOptions = require("schema-utils");
const schema = require("./webpackGitBannerPluginSchema.json");
const localPackage = require("./package.json");

const wrapComment = (str) => {
    if (!str.includes("\n")){ return Template.toComment(str); }
    return `/*!\n * ${str
        .replace(/\*\//g, "* /")
        .split("\n")
        .join("\n * ")}\n */`;
};

class GitBannerPlugin {
    constructor(options) {
        if (arguments.length > 1){ throw new Error("GitBannerPlugin only takes one argument (pass an options object)"); }

        validateOptions(schema, options, "Banner Plugin");

        if (typeof options === "string"){ options = {banner: options}; }
        this.options = options || {};
        this.banner = options.banner;
    }

    apply(compiler) {
        const options = this.options;
        const banner = this.banner;
        const matchObject = ModuleFilenameHelpers.matchObject.bind(undefined, options);
        let gitInfo = null;
        compiler.hooks.compilation.tap("GitBannerPlugin", (compilation, callback) => {
            if (gitInfo === null){
                execBash("git rev-parse HEAD", function (error, SHA) {
                    SHA = SHA.replace("\n", "");
                    execBash('git diff --shortstat', function (error2, isDirty) {
                        isDirty = isDirty.replace("\n", "");
                        if (isDirty !== "") {
                            isDirty = "\nDirty build: " + isDirty;
                        } else {
                            isDirty = "\nClean build";
                        }
                        gitInfo = {SHA, isDirty};
                        continueCompile();
                    });
                });
            }else{
                continueCompile();
            }
            function continueCompile(){
                compilation.hooks.optimizeChunkAssets.tap("GitBannerPlugin", (chunks) => {
                    for (const chunk of chunks) {
                        if (options.entryOnly && !chunk.canBeInitial()) {
                            continue;
                        }

                        for (const file of chunk.files) {
                            if (!matchObject(file)) {
                                continue;
                            }

                            let basename;
                            let query = "";
                            let filename = file;
                            const hash = compilation.hash;
                            const querySplit = filename.indexOf("?");

                            if (querySplit >= 0) {
                                query = filename.substr(querySplit);
                                filename = filename.substr(0, querySplit);
                            }

                            const lastSlashIndex = filename.lastIndexOf("/");

                            if (lastSlashIndex === -1) {
                                basename = filename;
                            } else {
                                basename = filename.substr(lastSlashIndex + 1);
                            }

                            const comment = compilation.getPath(banner, {
                                hash,
                                chunk,
                                filename,
                                basename,
                                query
                            });
                            let fullBanner = `${localPackage.name} - ${gitInfo.SHA} ${gitInfo.isDirty} \n${comment} \nCompiled on ${new Date().toDateString()} ${new Date().toTimeString()}`;
                            if (!options.raw){
                                fullBanner = wrapComment(fullBanner);
                            }
                            compilation.assets[file] = new ConcatSource(
                                fullBanner,
                                "\n",
                                compilation.assets[file]
                            );
                        }
                    }
                });
            }
        });
    }
}

module.exports = GitBannerPlugin;
