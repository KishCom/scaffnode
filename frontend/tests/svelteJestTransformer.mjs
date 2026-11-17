import {compile} from "svelte/compiler";

// Minimal Jest transformer for .svelte files.
// svelte-jester's sync transform only supports Svelte 3, and Jest 30 on Node 24
// prefers the sync require(esm) path - so we compile synchronously ourselves.
// NOTE: components that need svelte-preprocess (e.g. <style lang="scss">) are not
// supported here - keep test-targeted components to plain CSS/JS.
export default {
    process(sourceText, sourcePath) {
        const {js} = compile(sourceText, {
            filename: sourcePath,
            generate: "client",
            dev: true
        });
        return {code: js.code, map: js.map};
    }
};
