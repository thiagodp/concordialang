import { Options, randstr } from 'better-randstr';
import { isDefined } from '../../util/type-checking';
import { escapeChar } from "../util/escape";
import { Random } from "./Random";
import { RandomLong } from "./RandomLong";

export interface RandomStringOptions {
    escapeChars?: boolean
    avoidDatabaseChars?: boolean
}

const DEFAULT_RANDOM_STRING_OPTIONS: RandomStringOptions = < RandomStringOptions > {
    escapeChars: true,
    avoidDatabaseChars: false
};

function avoidDatabaseChar( char ) {
    const DATABASE_CHARS = "\"'%`";
    if ( DATABASE_CHARS.indexOf( char ) >= 0 ) {
        return ' '; // Return an empty space instead
    }
    return escapeChar( char );
}

/**
 * Random string generator, compatible with Unicode. Defaults to the ASCII range,
 * but the range can be changed easily.
 *
 * @author Thiago Delgado Pinto
 */
export class RandomString {

    public readonly MIN_PRINTABLE_ASCII_ISO: number = 32;
    public readonly MAX_PRINTABLE_ASCII_ISO: number = 255;

    private readonly _randomLong: RandomLong;
    private _minCharCode: number;
    private _maxCharCode: number;

    /**
     * Constructor
     *
     * @param _random
     * @param options Random string options.
     */
    constructor(
        private _random: Random,
        public options: RandomStringOptions = Object.assign( {}, DEFAULT_RANDOM_STRING_OPTIONS )
    ) {
        this._randomLong = new RandomLong( _random  );
        this._minCharCode = this.MIN_PRINTABLE_ASCII_ISO;
        this._maxCharCode = this.MAX_PRINTABLE_ASCII_ISO;
    }

    // VALUE GENERATION

    public exactly( length: number ): string {

        const self = this;

        const fn = (): number => {
            return self._random.generate();
        };

        let opt: Options = {
            random: fn,
            length: length,
            chars: [ this._minCharCode, this._maxCharCode ]
        };

        if ( this.options.escapeChars ) {
            opt.replacer = escapeChar;
        }

        if ( this.options.avoidDatabaseChars ) {
            opt.replacer = avoidDatabaseChar;
        }

        return randstr( opt );
    }

    public between( minimum: number, maximum: number ): string {
        const min = minimum < 0 ? 0 : minimum;
        const max = maximum < 0 ? 0 : maximum;
        if ( 0 === min && 0 === max ) {
            return '';
        }
        return this.exactly( this._randomLong.between( min, max ) );
    }

    // UTIL

	/**
	 * Sets or gets the minimum character code.
	 *
	 * @param min Minimum character code.
	 */
    public minCharCode( min?: number ): number {
        if ( isDefined( min ) && min >= 0 ) {
            this._minCharCode = min;
            // Prevent range error
            if ( this._maxCharCode < this._minCharCode ) {
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
    public maxCharCode( max?: number ): number  {
        if ( isDefined( max ) && max >= 0 ) {
            this._maxCharCode = max;
            // Prevent range error
            if ( this._minCharCode > this._maxCharCode ) {
                this._maxCharCode = this._minCharCode;
            }
        }
        return this._maxCharCode;
    }

}
