init();

// that no one else needs to worry about it again.
async function init() {
  if (typeof process == "object") {
      // We run in the npm/webpack environment.
      const [wasm, {main, setup}] = await Promise.all([
          import("wasm-game-of-life"),
          import("./index.js"),
      ]);
      setup(wasm);
      main();
  } else {
      const [{Chart, test, default: init}, {main, setup}] = await Promise.all([
          import("../pkg/wasm_pie.js"),
          import("./index.js"),
      ]);
      await init();
      setup(Chart);
      main();
  }
}