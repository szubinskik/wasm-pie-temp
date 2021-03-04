var Plotly = require('plotly.js-dist');
import { setListeners } from "./setListeners.js";

let wasm = null;

const input_network = document.getElementById("input-network");
const input_initial = document.getElementById("input-initial");

export function main() {
  document.getElementById("button-compute").addEventListener("click", on_compute);
  setListeners(document);
}

export function setup(Wasm) {
    wasm = Wasm;
}

function on_compute() {
  let str_net = input_network.value;
  let str_init = input_initial.value;
  let reactions = parse(str_net);
  let [pre, post, species] = to_matrix(reactions);
  let inits = parse_inits(str_init, species);
  let hazards = new Float64Array(reactions.map(r => r.rate));
  let res = compute(pre, post, inits, hazards);
  plot(res, species);
}

function parse(raw) {

  function parse_line(line) {
    let res = {
      pre : {},
      post : {}
    };
    let buffer = "";

    for (let i = 0; i < line.length; i++) {
      if (line[i] == ':')
      {
        res.rate = Number(buffer);
        buffer = "";
        line = line.slice(i+1);
        break;
      }
      buffer += line[i];
    }

    let prev_num = 1;
    for (let i = 0; i < line.length; i++) {
      if (line[i] == '*') {
        prev_num = parseInt(buffer);
        buffer = "";
      }
      else if ( line[i] == '+' || line[i] == '-' ) {
        if (buffer.trim() !== "")
          res.pre[buffer.trim()] = prev_num;
        prev_num = 1;
        buffer = "";
        if (line[i] == '-') {
          line = line.slice(i+2);
          break;
        }
      }
      else
        buffer += line[i];
    }

    prev_num = 1;
    for (let i = 0; i < line.length; i++) {
      if (line[i] == '*') {
        prev_num = parseInt(buffer);
        buffer = "";
      }
      else if ( line[i] == '+' ) {
        res.post[buffer.trim()] = prev_num;
        prev_num = 1;
        buffer = "";
      }
      else
        buffer += line[i];
    }

    if (buffer.trim() !== "")
      res.post[buffer.trim()] = prev_num;

    if (Object.keys(res.pre).length+Object.keys(res.post) < 1)
      return undefined;
    return res;
  }

  let reactions = [];

  for (let line of raw.trim().split('\n'))
  {
    let l = parse_line(line);
    if (l !== undefined)
      reactions.push(l);
  }
  
  return reactions;
}

function to_matrix(reactions) {
  let species_set = new Set();
  for (let r of reactions) {
    species_set = new Set([...species_set, ...Object.keys(r.pre)]);
    species_set = new Set([...species_set, ...Object.keys(r.post)]);
  }
  let species = Array.from(species_set);
  let n = species.length;

  let pre = [];
  let post = [];

  for (let r of reactions) {
    let pre_line = Array(n).fill(0);
    let post_line = Array(n).fill(0);
    for (let s of Object.entries(r.pre))
      pre_line[species.findIndex(e => e == s[0])] = s[1];
    for (let s of Object.entries(r.post))
      post_line[species.findIndex(e => e == s[0])] = s[1];

    pre = [...pre, ...pre_line];
    post = [...post, ...post_line];
  }
  return [new Int32Array(pre), new Int32Array(post), species];
}

function parse_inits(raw, species) {
  // TODO - this sets zero as default
  let inits = Array(species.length).fill(0);
  for (let line of raw.trim().split('\n')) {
    let name = line.split('=')[0].trim();
    let val = parseInt(line.split('=')[1]);
    inits[species.findIndex(e => e == name)] = val;
  }
  return new Int32Array(inits);
}

function compute(pre, post, inits, hazards) {
  return wasm.compute(pre, post, inits, hazards);
}

function plot(res, species) {
  
  let data = [];
  species.forEach((s, i) => {
    data.push({
      x: res.get('time'),
      y: res.get(i.toString()),
      type: 'scatter',
      mode: 'line',
      name: s,
    });
  });
  Plotly.newPlot('div-graph', data);
}