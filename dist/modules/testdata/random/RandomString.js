"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RandomLong_1 = require("./RandomLong");
const TypeChecking_1 = require("../../util/TypeChecking");
const escape_1 = require("../util/escape");
/**
 * Random string generator, compatible with Unicode. Defaults to the ASCII range,
 * but the range can be changed easily.
 *
 * @author Thiago Delgado Pinto
 */
class RandomString {
    /**
     * Constructor
     *
     * @param _random
     * @param escaped Whether wants to generate escape strings. Defaults to true.
     */
    constructor(_random, escaped = true) {
        this._random = _random;
        this.escaped = escaped;
        this.MIN_PRINTABLE_ASCII = 32;
        this.MAX_PRINTABLE_ASCII = 126;
        this._randomLong = new RandomLong_1.RandomLong(_random);
        this._minCharCode = this.MIN_PRINTABLE_ASCII;
        this._maxCharCode = this.MAX_PRINTABLE_ASCII;
    }
    // VALUE GENERATION
    exactly(length) {
        if (length <= 0) {
            return '';
        }
        let tmp = '';
        for (let i = 0; i < length; ++i) {
            tmp += this.randomCharCode();
        }
        if (!this.escaped) {
            return tmp;
        }
        // Guarantee the minimum size
        while ((tmp = escape_1.escapeString(tmp)).length < length) {
            tmp += this.randomCharCode();
        }
        // Guarantee the maximum size
        return tmp.substr(0, length);
    }
    between(minimum, maximum) {
        const min = minimum < 0 ? 0 : minimum;
        const max = maximum < 0 ? 0 : maximum;
        if (0 === min && 0 === max) {
            return '';
        }
        return this.exactly(this._randomLong.between(min, max));
    }
    // UTIL
    randomCharCode() {
        return String.fromCharCode(this._randomLong.between(this._minCharCode, this._maxCharCode));
    }
    minCharCode(min) {
        if (TypeChecking_1.isDefined(min) && min >= 0) {
            this._minCharCode = min;
            // Prevent range error
            if (this._maxCharCode < this._minCharCode) {
                this._maxCharCode = this._minCharCode;
            }
        }
        return this._minCharCode;
    }
    maxCharCode(max) {
        if (TypeChecking_1.isDefined(max) && max >= 0) {
            this._maxCharCode = max;
            // Prevent range error
            if (this._minCharCode > this._maxCharCode) {
                this._minCharCode = this._maxCharCode;
            }
        }
        return this._maxCharCode;
    }
}
exports.RandomString = RandomString;
