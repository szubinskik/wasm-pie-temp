const Lotka_Volterra_net = "\
1:           Prey -> 2*Prey\n\
0.005: Predator + Prey -> 2*Predator\n\
0.6:      Predator -> \
";

const Lotka_Volterra_init = "\
Prey = 50\n\
Predator = 100\
";

const Michaelis_Menten_net = "\
0.00166:  S + E -> SE\n\
0.0001:    SE -> S + E\n\
0.1:            SE -> P + E\
";

const Michaelis_Menten_init = "\
S = 301\n\
E = 120\n\
SE = 0\n\
P = 0\
";

const Dimerisation_net = "\
0.00166:  2*P -> P2\n\
0.2:            P2 -> 2*P\
";

const Dimerisation_init = "\
P = 301\n\
P2 = 0\
";

const TK_2000_1_net = "\
0.03125:           X1 + X2 -> 2 * X2\n\
0.03125:           X2+ X3 -> 2 * X3\n\
0.03125:           X3 + X4 -> 2 * X4\n\
0.03125:           X4+ X1 -> 2 * X1\n\
\n\
0.00390625:  X1 ->\n\
0.00390625:  X2 ->\n\
0.00390625:  X3 ->\n\
0.00390625:  X4 ->\n\
\n\
0.125: -> X1\n\
0.125: -> X2\n\
0.125: -> X3\n\
0.125: -> X4";

const TK_2000_1_init = "\
X1 = 0\n\
X2 = 0\n\
X3 = 0\n\
X4 = 0";

export function setListeners(document) {
    const input_network = document.getElementById("input-network");
    const input_initial = document.getElementById("input-initial");

    document.getElementById("item-lotka").addEventListener("click", () => {
        input_network.value = Lotka_Volterra_net;
        input_initial.value = Lotka_Volterra_init;
    });

    document.getElementById("item-menten").addEventListener("click", () => {
        input_network.value = Michaelis_Menten_net;
        input_initial.value = Michaelis_Menten_init;
    });

    document.getElementById("item-dimerisation").addEventListener("click", () => {
        input_network.value = Dimerisation_net;
        input_initial.value = Dimerisation_init;
    });

    document.getElementById("item-2000-1").addEventListener("click", () => {
        input_network.value = TK_2000_1_net;
        input_initial.value = TK_2000_1_init;
    });
}