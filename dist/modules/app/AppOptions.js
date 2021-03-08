"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasSomeOptionThatRequiresAPlugin = void 0;
function hasSomeOptionThatRequiresAPlugin(o) {
    return o.script || o.run || o.result;
}
exports.hasSomeOptionThatRequiresAPlugin = hasSomeOptionThatRequiresAPlugin;
