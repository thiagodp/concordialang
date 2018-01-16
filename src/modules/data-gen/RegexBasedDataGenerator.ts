import RandExp from 'randexp';
import { RandomString } from './random/RandomString';
import { StringLimits } from './limits/StringLimits';

/**
 * Regular Expression -based data generator.
 * 
 * @author Thiago Delgado Pinto
 */
export class RegexBasedDataGenerator {

    /**
     * Constructor
     * 
     * @param _random Random value generator
     * @param _expression Regular expression
     * @param _randomTriesToInvalidValues How many tries to generate random invalid values.
     */
    constructor(
        private _random: RandomString,
        private _expression: string,
        private _randomTriesToInvalidValues: number = 5
    ) {
        if ( this._randomTriesToInvalidValues < 0 ) {
            this._randomTriesToInvalidValues = 0;
        }
    }

    /**
     * Returns a value considered valid.
     */
    public valid(): string {
        return this.generateFor( this._expression );
    }

    /**
     * Returns a value considered invalid.
     */    
    public invalid(): string {

        // Generates a random string, hoping that it does not match the expression.
        // This is faster and possibly less error prone than negate the expression.
        const regex = new RegExp( this._expression );
        for ( let i = 0; i < this._randomTriesToInvalidValues; ++i ) {
            let val = this._random.between( 0, StringLimits.MAX );
            // If the value does not match the regex, it is considered invalid
            if ( ! regex.test( val ) ) {
                return val;
            }
        }

        // Try to generate a value based on the negated expression
        const negatedExp: string = this.negateExpression( this._expression );
        return this.generateFor( negatedExp );
    }

    /**
     * Negates the given expression.
     * 
     * @param expression Expression
     */
    public negateExpression( expression: string ): string {
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
    private generateFor( expression: string ): string {
        return new RandExp( expression ).gen();
    }
    
}