"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upperFirst = exports.convertCase = void 0;
const case_1 = require("case");
const CaseType_1 = require("./CaseType");
function convertCase(text, type) {
    switch (type.toString().trim().toLowerCase()) {
        case CaseType_1.CaseType.CAMEL: return case_1.camel(text);
        case CaseType_1.CaseType.PASCAL: return case_1.pascal(text);
        case CaseType_1.CaseType.SNAKE: return case_1.snake(text);
        case CaseType_1.CaseType.KEBAB: return case_1.kebab(text);
        default: return text; // do nothing
    }
}
exports.convertCase = convertCase;
function upperFirst(text) {
    if (!!text[0]) {
        return text[0].toUpperCase() + text.substr(1);
    }
    return text;
}
exports.upperFirst = upperFirst;
