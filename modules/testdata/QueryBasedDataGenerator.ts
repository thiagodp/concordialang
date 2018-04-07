import { RawDataGenerator } from "./raw/RawDataGenerator";
import { RandomLong } from "./random/RandomLong";
import { QueryCache } from "../db/QueryCache";
import { Queryable } from "../req/Queryable";

/**
 * Query-based data generator.
 *
 * Known limitations:
 * - It always generates values from the first column returned by the query.
 *
 * @author Thiago Delgado Pinto
 */
export class QueryBasedDataGenerator< T > {

    /**
     * Constructor
     *
     * @param _random Random number generator.
     * @param _rawDataGenerator Raw data generator
     * @param _queriable Queriable
     * @param _queryCache Query cache
     * @param _query SQL query
     * @param _maxTries Max tries to generate an element which does not belong to the set
     */
    constructor(
        private _random: RandomLong,
        private _rawDataGenerator: RawDataGenerator< T >,
        private _queriable: Queryable,
        private _queryCache: QueryCache,
        private _query: string,
        private _maxTries: number = 10
    ) {
    }

    // DATA GENERATION

    public async firstElement(): Promise< T | null > {
        const values: any[] = await this.queryValues();
        return values.length > 0
            ? this.valueOfTheFirstColumn( values[ 0 ] )
            : null;
    }

    public async secondElement(): Promise< T | null > {
        const values: any[] = await this.queryValues();
        return values.length > 1
            ? this.valueOfTheFirstColumn( values[ 1 ] )
            : null;
    }

    public async randomElement(): Promise< T | null > {
        /// TO-DO: use LIMIT and OFFSET to generate the random number
        // e.g.: LIMIT 1 OFFSET random( 1, COUNT( * ) )
        const values: any[] = await this.queryValues();
        if ( values.length < 1 ) {
            return null;
        }
        const index: number = this._random.between( 0, values.length - 1 );
        return this.valueOfTheFirstColumn( values[ index ] );
    }

    public async penultimateElement(): Promise< T | null > {
        const values: any[] = await this.queryValues();
        const len: number = values.length;
        return len > 1
            ? this.valueOfTheFirstColumn( values[ len - 2 ] )
            : null;
    }

    public async lastElement(): Promise< T | null > {
        const values: any[] = await this.queryValues();
        const len: number = values.length;
        return len > 0
            ? this.valueOfTheFirstColumn( values[ len - 1 ] )
            : null;
    }

    public async notInSet(): Promise< T | null > {
        for ( let i = 0; i < this._maxTries; ++i ) {
            const val: T = this._rawDataGenerator.randomBetweenMinAndMax();
            const found: boolean = await this.hasValue( val );
            if ( ! found ) {
                return val;
            }
        }
        return null;
    }

    // UTIL

    private valueOfTheFirstColumn( row: any[] ): T | null {
        if ( ! row ) {
            return null;
        }
        for ( let key in row ) { // works for both an object or an array of values
            return row[ key ];
        }
        return null;
    }

    private async queryValues(): Promise< any[] > {
        if ( this._queryCache.has( this._query ) ) {
            return this._queryCache.get( this._query );
        }
        const result = await this._queriable.query( this._query );
        this._queryCache.put( this._query, result );
        return result;
    }


    private async hasValue( value: T ): Promise< boolean > {
        const values: any[] = await this.queryValues();
        for ( let row of values ) {
            const val = this.valueOfTheFirstColumn( row );
            if ( val == value ) {
                return true;
            }
        }
        return false;
    }

}