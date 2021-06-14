import jsesc from 'jsesc';
import RandExp from 'randexp';

import { adjustValueToTheRightType, ValueType } from '../util/ValueTypeDetector';
import { StringLimits } from './limits/StringLimits';
import { RandomLong } from './random/RandomLong';
import { RandomString } from './random/RandomString';

/**
 * Regular Expression -based data generator.
 *
 * Known limitations:
 * - It cannot negate all kinds of expressions. For instance, '.'.
 *
 * @author Thiago Delgado Pinto
 */
export class RegexBasedDataGenerator {

    /**
     * Constructor
     *
     * @param _randomLong Random long value generator to use as random generator.
     * @param _randomString Random string value generator to use.
     * @param _expression Regular expression.
     * @param _randomTriesToInvalidValues How many tries to generate random invalid values.
	 * @param _maxStringSize Maximum string size.
     */
    constructor(
        private _randomLong: RandomLong,
        private _randomString: RandomString,
        private _expression: string,
        private _valueType: ValueType = ValueType.STRING,
		private _randomTriesToInvalidValues: number = 10,
		private _maxStringSize?: number,
    ) {

        // Overrides the number generator in order to get "predictable" random values
        RandExp.prototype.randInt = ( from, to ) => {
            return _randomLong.between( from, to );
        };

        if ( this._randomTriesToInvalidValues < 0 ) {
            this._randomTriesToInvalidValues = 0;
		}

		if ( this._maxStringSize <= 0 ) {
			this._maxStringSize = StringLimits.MAX;
		}
    }

    /**
     * Returns a value considered valid.
     */
    public valid(): string {
        return this.generateFor( this._expression, this._valueType );
    }

    /**
     * Returns a value considered invalid.
     */
    public invalid(): string {

		const max = this._maxStringSize || StringLimits.MAX;

        // Generates a random string, hoping that it does not match the expression.
        // This is faster and possibly less error prone than negate the expression.
        const regex = new RegExp( this._expression );
        for ( let i = 0; i < this._randomTriesToInvalidValues; ++i ) {
            let val = this._randomString.between( 0, max );
            // If the value does not match the regex, it is considered invalid
            if ( ! regex.test( val ) ) {
				// console.log( 'EXPRESSION', this._expression, 'value', val );
                return val;
            }
        }

        // Try to generate a value based on the negated expression
        const negatedExp: string = this.negateExpression( this._expression );
		const value = this.generateFor( negatedExp, this._valueType );

		// console.log( 'NEGATED EXPRESSION', negatedExp, 'value', value );

		// Limit the value to the maximum size, if needed
		if ( value.length >= max ) {
			return value.substr( 0, max );
		}
		return value;
    }

    /**
     * Negates the given expression.
     *
     * @param expression Expression
     */
    public negateExpression( expression: string ): string {
        if ( expression.startsWith( '[^' ) ) {
            return '[' + expression.substring( 2 );
        }
        if ( expression.startsWith( '[' ) ) {
            return '[^' + expression.substring( 1 );
        }
        return '[^(' + expression + ')]';
    }

    /**
     * Generates a value for the given expression.
     *
     * @param expression Expression
     */
    private generateFor( expression: string, valueType: ValueType = ValueType.STRING ): string {
        const value = new RandExp( expression ).gen();
        if ( ValueType.STRING === valueType ) {
			// @see https://github.com/mathiasbynens/jsesc#api
            return jsesc( value, { quotes: 'double' } );
        }
        return adjustValueToTheRightType( value, valueType );
    }

}
