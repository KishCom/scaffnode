import App from './App.svelte';
import './global.css';

const app = new App({
    target: document.getElementById('ContentPane'), // entry point in ../public/index.html
});

export default app;
