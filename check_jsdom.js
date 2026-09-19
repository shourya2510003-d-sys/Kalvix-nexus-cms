const fetch = require('node-fetch');
const jsdom = require("jsdom");
const { JSDOM, VirtualConsole } = jsdom;

(async () => {
  try {
    const res = await fetch('http://localhost:4321');
    const html = await res.text();
    
    const virtualConsole = new VirtualConsole();
    virtualConsole.sendTo(console, { omitJSDOMErrors: false });

    const dom = new JSDOM(html, {
      url: "http://localhost:4321/",
      runScripts: "dangerously",
      resources: "usable",
      virtualConsole
    });

    dom.window.addEventListener("error", (event) => {
      console.error("JSDOM ERROR:", event.error);
    });
    
    dom.window.addEventListener("unhandledrejection", (event) => {
      console.error("JSDOM PROMISE ERROR:", event.reason);
    });

    setTimeout(() => {
      console.log("Finished waiting for JSDOM.");
      process.exit(0);
    }, 4000);
  } catch (err) {
    console.error("Script error:", err);
  }
})();
