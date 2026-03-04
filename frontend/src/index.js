import {mount} from "svelte";
import App from "./App.svelte";
import "./../scss/style.scss";

const app = mount(App, {target: document.getElementById("ScaffnodeHolder")});

export default app;
