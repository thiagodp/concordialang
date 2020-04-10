"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const better_randstr_1 = require("better-randstr");
const TypeChecking_1 = require("../../util/TypeChecking");
const escape_1 = require("../util/escape");
const RandomLong_1 = require("./RandomLong");
const DEFAULT_RANDOM_STRING_OPTIONS = {
    escapeChars: true,
    avoidDatabaseChars: false
};
function avoidDatabaseChar(char) {
    const DATABASE_CHARS = "\"'%`";
    if (DATABASE_CHARS.indexOf(char) >= 0) {
        return ' '; // Return an empty space instead
    }
    return escape_1.escapeChar(char);
}
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
     * @param options Random string options.
     */
    constructor(_random, options = Object.assign({}, DEFAULT_RANDOM_STRING_OPTIONS)) {
        this._random = _random;
        this.options = options;
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
        let opt = {
            random: fn,
            length: length,
            chars: [this._minCharCode, this._maxCharCode]
        };
        if (this.options.escapeChars) {
            opt.replacer = escape_1.escapeChar;
        }
        if (this.options.avoidDatabaseChars) {
            opt.replacer = avoidDatabaseChar;
        }
        return better_randstr_1.randstr(opt);
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
