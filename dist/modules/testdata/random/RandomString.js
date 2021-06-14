import { randstr } from 'better-randstr';
import { isDefined } from '../../util/TypeChecking';
import { escapeChar } from "../util/escape";
import { RandomLong } from "./RandomLong";
const DEFAULT_RANDOM_STRING_OPTIONS = {
    escapeChars: true,
    avoidDatabaseChars: false
};
function avoidDatabaseChar(char) {
    const DATABASE_CHARS = "\"'%`";
    if (DATABASE_CHARS.indexOf(char) >= 0) {
        return ' '; // Return an empty space instead
    }
    return escapeChar(char);
}
/**
 * Random string generator, compatible with Unicode. Defaults to the ASCII range,
 * but the range can be changed easily.
 *
 * @author Thiago Delgado Pinto
 */
export class RandomString {
    /**
     * Constructor
     *
     * @param _random
     * @param options Random string options.
     */
    constructor(_random, options = Object.assign({}, DEFAULT_RANDOM_STRING_OPTIONS)) {
        this._random = _random;
        this.options = options;
        this.MIN_PRINTABLE_ASCII_ISO = 32;
        this.MAX_PRINTABLE_ASCII_ISO = 255;
        this._randomLong = new RandomLong(_random);
        this._minCharCode = this.MIN_PRINTABLE_ASCII_ISO;
        this._maxCharCode = this.MAX_PRINTABLE_ASCII_ISO;
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
            opt.replacer = escapeChar;
        }
        if (this.options.avoidDatabaseChars) {
            opt.replacer = avoidDatabaseChar;
        }
        return randstr(opt);
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
    /**
     * Sets or gets the minimum character code.
     *
     * @param min Minimum character code.
     */
    minCharCode(min) {
        if (isDefined(min) && min >= 0) {
            this._minCharCode = min;
            // Prevent range error
            if (this._maxCharCode < this._minCharCode) {
                this._minCharCode = this._maxCharCode;
            }
        }
        return this._minCharCode;
    }
    /**
     * Sets or gets the maximum character code.
     *
     * @param max Maximum character code.
     */
    maxCharCode(max) {
        if (isDefined(max) && max >= 0) {
            this._maxCharCode = max;
            // Prevent range error
            if (this._minCharCode > this._maxCharCode) {
                this._maxCharCode = this._minCharCode;
            }
        }
        return this._maxCharCode;
    }
}
