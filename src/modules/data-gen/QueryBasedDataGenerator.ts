import { RawDataGenerator } from "./raw/RawDataGenerator";
import { RandomLong } from "./random/RandomLong";
import { DatabaseInterface } from "../db/DatabaseInterface";
import { QueryCache } from "../db/QueryCache";

/**
 * Query-based data generator.
 * 
 * @author Thiago Delgado Pinto
 */
export class QueryBasedDataGenerator< T > {

    /**
     * Constructor
     * 
     * @param _random Random number generator.
     * @param _rawDataGenerator Raw data generator
     * @param _dbi Database interface
     * @param _connCache Connection cache
     * @param _queryCache Query cache
     * @param _query SQL query 
     * @param _maxTries Max tries to generate an element which does not belong to the set
     */
    constructor(
        private _random: RandomLong,
        private _rawDataGenerator: RawDataGenerator< T >,
        private _dbi: DatabaseInterface,
        private _queryCache: QueryCache,
        private _query: string,
        private _maxTries: number = 10
    ) {

    }

    // DATA GENERATION

    public async firstElement(): Promise< T | null > {
        return null; // TO-DO
    }

    public async secondElement(): Promise< T | null > {
        return null; // TO-DO
    }

    public async randomElement(): Promise< T | null > {
        return null; // TO-DO
    }

    public async penultimateElement(): Promise< T | null > {
        return null; // TO-DO
    }

    public async lastElement(): Promise< T | null > {
        return null; // TO-DO
    }

    public async notInSet(): Promise< T | null > {
        for ( let i = 0; i < this._maxTries; ++i ) {
            let val: T = this._rawDataGenerator.randomBetweenMinAndMax();
            if ( ! this.hasValue( val ) ) {
                return val;
            }
        }
        return null;
    }

    // UTIL

    private async queryValues(): Promise< Map< string, any >[] > {

        if ( this._queryCache.has( this._query ) ) {
            return this._queryCache.get( this._query );
        }

        let result: Map< string, any >[] = [];

        // exec query...        
        this._dbi.query( this._query )

        this._queryCache.put( this._query, result );

        return result;
    }


    private hasValue( value: T ): boolean {
        return false; // TO-DO
    }

}