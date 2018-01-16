import { RandomLong } from "./random/RandomLong";
import { RawDataGenerator } from "./raw/RawDataGenerator";

/**
 * List-based data generator
 * 
 * @author Thiago Delgado Pinto
 */
export class ListBasedDataGenerator< T > {

    /**
     * Constructor
     * 
     * @param _random Random number generator.
     * @param _rawDataGenerator Raw data generator.
     * @param _values Values.
     * @param _maxTries Max tries to generate a value that is not in the set.
     */
    constructor(
        private _random: RandomLong,
        private _rawDataGenerator: RawDataGenerator< T >,
        private _values: T[],
        private _maxTries: number = 10
    ) {
    }

    public isEmpty(): boolean {
        return 0 === this._values.length;
    }

    // DATA GENERATION

    public firstElement(): T | null {
        return this.isEmpty() ? null : this._values[ 0 ];
    }

    public secondElement(): T | null {
        return this._values.length > 1 ? this._values[ 1 ] : null;
    }

    public randomElement(): T | null {
        if ( this.isEmpty() ) {
            return null;
        }
        const index: number = this._random.between( 0, this._values.length - 1 );
        return this._values[ index ];
    }

    public penultimateElement(): T | null {
        const len: number = this._values.length;
        return len > 1 ? this._values[ len - 2 ] : null; 
    }

    public lastElement(): T | null {
        if ( this.isEmpty() ) {
            return null;
        }
        return this._values[ this._values.length - 1 ];        
    }

    public notInSet(): T | null {
        for ( let i = 0; i < this._maxTries; ++i ) {
            let val: T = this._rawDataGenerator.randomBetweenMinAndMax();
            if ( this._values.indexOf( val ) < 0 ) {
                return val;
            }
        }
        return null;
    }

}