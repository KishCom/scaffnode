import {mount, unmount} from "svelte";
import App from "./App.svelte";

describe("App component", () => {
    test("mounts and renders the greeting", () => {
        const target = document.createElement("div");
        document.body.appendChild(target);

        const app = mount(App, {target});

        expect(target.querySelector("h1")).not.toBeNull();
        expect(target.textContent).toContain("Hello from Svelte!");

        unmount(app);
        target.remove();
    });
});
