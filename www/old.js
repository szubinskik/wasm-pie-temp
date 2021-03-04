class Chart {}

const canvas = document.getElementById("canvas");
const status = document.getElementById("status");
let wasm = null;
let chart = null;

export function main() {
    console.log(wasm.compute());
    setupCanvas();
}

export function setup(Wasm) {
    wasm = Wasm;
    Chart = wasm.Chart;
}

function setupCanvas() {
	const dpr = window.devicePixelRatio || 1.0;
    const aspectRatio = canvas.width / canvas.height;
    const size = canvas.parentNode.offsetWidth * 0.8;
    canvas.style.width = size + "px";
    canvas.style.height = size / aspectRatio + "px";
    canvas.width = size;
    canvas.height = size / aspectRatio;
    updatePlot();
}

function updatePlot() {
    status.innerText = `Rendering...`;
    chart = null;
    const start = performance.now();
    chart = Chart.power("canvas", Number(2))
    const end = performance.now();
    status.innerText = `Rendered in ${Math.ceil(end - start)}ms`;
}