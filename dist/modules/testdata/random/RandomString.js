"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RandomLong_1 = require("./RandomLong");
const TypeChecking_1 = require("../../util/TypeChecking");
const better_randstr_1 = require("better-randstr");
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
        this.MAX_PRINTABLE_ASCII = 255;
        this._randomLong = new RandomLong_1.RandomLong(_random);
        this._minCharCode = this.MIN_PRINTABLE_ASCII;
        this._maxCharCode = this.MAX_PRINTABLE_ASCII;
    }
    // VALUE GENERATION
    exactly(length) {
        const self = this;
        const fn = () => {
            return self._random.generate();
        };
        return better_randstr_1.randstr({
            random: fn,
            length: length,
            replacer: escape_1.escapeChar,
            chars: [this._minCharCode, this._maxCharCode]
        });
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
