"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Cfg_1 = require("./Cfg");
class ResolvedUIE {
}
function resolveUIE(uie, uieValueGen) {
    const cfg = new Cfg_1.Cfg();
    return null;
}
function resolveProperty(uip) {
}
function generate(uie, doc, uieMap) {
    const name = makeFullVariableName(doc, uie);
    // analisar e reutilizar coisas q já foram feitas...
    // const propertyCfg = propertiesOf( name, );
    // const cfg = makeConfig( propertyCfg );
    // const dtcMap = evaluateDataTestCases( cfg );
}
function makeFullVariableName(doc, uie) {
    return ''; // TODO:
}
// =============================================================================
// Resolução de PROPRIEDADES dos UIE (vem primeiro)
// Há PROPRIEDADES que dependem de VALOR GERADO de outros UIE.
// Um VALOR GERADO depende de uma DTC.
// Algumas DTC dependem de PROPRIEDADES.
// =============================================================================
// Conjunto de possíveis DTCs devem ser atreladas à geração do cenário. A
// combinação faz parte da construção do resultado, independente do algoritmo.
