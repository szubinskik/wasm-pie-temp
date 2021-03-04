mod utils;
mod gillespie;
use ndarray::Array;

use wasm_bindgen::prelude::*;
use js_sys;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn compute(pre: &js_sys::Int32Array, post: &js_sys::Int32Array, inits: &js_sys::Int32Array, hazards: &js_sys::Float64Array)-> js_sys::Map {
    let res = js_sys::Map::new();

    let y_len = inits.length();
    let x_len = pre.length() / y_len;
    
    let m_pre = Array::from_shape_vec((x_len as usize, y_len as usize), pre.to_vec()).unwrap();
    //log!("{}", m_pre);
    let m_post = Array::from_shape_vec((x_len as usize, y_len as usize), post.to_vec()).unwrap();
    let m_inits = Array::from(inits.to_vec());
    let m_hazards = Array::from(hazards.to_vec());

    let (times, xes) = gillespie::compute(&m_pre, &m_post, &m_inits, &m_hazards);
    let times = js_sys::Float64Array::from(&times.to_vec()[..]);
    res.set(&js_sys::JsString::from("time"), &times);

    let mut n = 0;
    for col in xes.gencolumns() {
        res.set(&js_sys::JsString::from(n.to_string()), &js_sys::Int32Array::from(&col.to_vec()[..]));
        n = n+1;
    }
    return res;
}
