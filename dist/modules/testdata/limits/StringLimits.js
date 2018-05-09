"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Limits for string values.
 *
 * @author Thiago Delgado Pinto
 */
class StringLimits {
}
StringLimits.MIN = 0;
StringLimits.MAX = 32767; // max short
// Since MAX can produce very long strings for testing purposes, we are also defining
// a "usual" maximum length value.
StringLimits.MAX_USUAL = 127; // max byte
exports.StringLimits = StringLimits;
//# sourceMappingURL=StringLimits.js.map