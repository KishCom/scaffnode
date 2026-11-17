import {mount} from "svelte";
import App from "./App.svelte";
import "./../scss/style.scss";

// The mount target only exists on some pages (see views/index.html) - don't crash the others
const target = document.getElementById("svelteapp");
const app = target ? mount(App, {target}) : null;

export default app;
