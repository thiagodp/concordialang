import { RandomLong } from "./RandomLong";
import { Random } from "./Random";
import { isDefined } from '../../util/TypeChecking';
import { randstr } from 'better-randstr';
import { escapeChar } from "../util/escape";

/**
 * Random string generator, compatible with Unicode. Defaults to the ASCII range,
 * but the range can be changed easily.
 *
 * @author Thiago Delgado Pinto
 */
export class RandomString {

    public readonly MIN_PRINTABLE_ASCII: number = 32;
    public readonly MAX_PRINTABLE_ASCII: number = 255;

    private readonly _randomLong: RandomLong;
    private _minCharCode: number;
    private _maxCharCode: number;

    /**
     * Constructor
     *
     * @param _random
     * @param escaped Whether wants to generate escape strings. Defaults to true.
     */
    constructor( private _random: Random, public escaped: boolean = true ) {
        this._randomLong = new RandomLong( _random  );
        this._minCharCode = this.MIN_PRINTABLE_ASCII;
        this._maxCharCode = this.MAX_PRINTABLE_ASCII;
    }

    // VALUE GENERATION

    public exactly( length: number ): string {

        const self = this;

        const fn = (): number => {
            return self._random.generate();
        };

        return randstr( {
            random: fn,
            length: length,
            replacer: escapeChar,
            chars: [ this._minCharCode, this._maxCharCode ]
        } );
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

    public minCharCode( min?: number ) {
        if ( isDefined( min ) && min >= 0 ) {
            this._minCharCode = min;
            // Prevent range error
            if ( this._maxCharCode < this._minCharCode ) {
                this._maxCharCode = this._minCharCode;
            }
        }
        return this._minCharCode;
    }

    public maxCharCode( max?: number ) {
        if ( isDefined( max ) && max >= 0 ) {
            this._maxCharCode = max;
            // Prevent range error
            if ( this._minCharCode > this._maxCharCode ) {
                this._minCharCode = this._maxCharCode;
            }
        }
        return this._maxCharCode;
    }

}