use ndarray::{Axis, Array, Array2, Array1, arr2, arr1, s};
use rand_distr::{Exp, Distribution};
use rand::distributions::WeightedIndex;

macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

// Check precision!
// [TODO]
type Matrix<T> = Array2::<T>;
type Vector<T> = Array1::<T>;

fn gillespie<F: Fn(&Vector<i32>) -> Vector<f64>> (steps: usize,
             pre: &Matrix<i32>, post: &Matrix<i32>,
             init: &Vector<i32>, h: F) -> (Vector<f64>, Matrix<i32>) {

    let diff = post - pre;
    let n = init.len();

    let mut rng = rand::thread_rng();

    let mut times = Array::from_elem(steps+1, 0_f64);
    let mut res = Array::from_elem((steps+1, n), 0_i32);
    let mut x = init.clone();
    let mut t = 0_f64;

    res.index_axis_mut(Axis(0), 0).assign(&x);
    times[0] = t;
    
    for i in 1..steps+1 {
        let haz = h(&x);
        let exp = Exp::new(haz.sum()).unwrap();
        let n_t = exp.sample(&mut rng);
        t += n_t;

        let weights = haz;
        // [TODO] What to do with zero weights?
        if weights.sum() < 1e-12_f64 {
            times.slice_mut(s![i..]).fill(t);
            // weights += 1_f64;
            break;
        }

        let dist = WeightedIndex::new(&weights).unwrap();
        let op = dist.sample(&mut rng);
        x = &x + &diff.row(op);
        res.index_axis_mut(Axis(0), i).assign(&x);
        times[i] = t;
    }
    
    (times, res)
}

pub fn compute(pre: &Matrix<i32>, post: &Matrix<i32>, inits: &Vector<i32>, hazards: &Vector<f64>) -> (Vector<f64>, Matrix<i32>) {
    //let (times, xes) = gillespie(10000, &arr2(&[[1, 0],[1, 1],[0, 1]]), &arr2(&[[2, 0],[0, 2],[0, 0]]), &arr1(&[50, 100]), h);
    
    fn choose(n: i32, mut k: i32) -> i32 {
        if n < k {
            return 0;
        }

        k = std::cmp::min(n-k, k);
        let mut num = 1;
        let mut den = 1;
        for i in 0..k {
            num *= n-i;
            den *= i+1;
        }
        return num / den;
    };
    
    let h1 = |x: &Vector<i32>| {
        let mut res: Vec<f64> = Vec::new();
        // TODO ignore empty rules
        for i in 0..hazards.len() {
            let mut t = hazards[[i]];
            for j in 0..pre.row(i).len() {
                if pre[[i, j]] != 0 {
                    t *= choose(x[[j]], pre[[i, j]]) as f64;
                }
            }

            res.push(t);
        };
        return Array::from(res);
    };

    let (times, xes) = gillespie(10000, pre, post, inits, h1);
    return (times, xes);
}