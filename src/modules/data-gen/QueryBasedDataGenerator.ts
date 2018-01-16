import { RawDataGenerator } from "./raw/RawDataGenerator";
import { DatabaseWrapper } from "./db/DatabaseWrapper";
import { RandomLong } from "./random/RandomLong";

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
     * @param _connCache Connection cache
     * @param _queryCache Query cache
     * @param _query Query 
     * @param _maxTries Max tries to generate an element which does not belong to the set
     */
    constructor(
        private _random: RandomLong,
        private _rawDataGenerator: RawDataGenerator< T >,
        private _connCache: ConnectionCache,
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

        this._queryCache.put( this._query, result );

        return result;
    }


    private hasValue( value: T ): boolean {
        return false; // TO-DO
    }

}

/**
 * Connection cache.
 * 
 * @author Thiago Delgado Pinto
 */
export class ConnectionCache {

    private _cache: Map< string, DatabaseWrapper > = new Map< string, DatabaseWrapper >();

    has( dbName: string ): boolean {
        return this._cache.has( dbName );
    }

    put( dbName: string, value: DatabaseWrapper ): void {
        this._cache.set( dbName, value );
    }

    get( dbName: string ): DatabaseWrapper | null {
        return this._cache.get( dbName );
    }

    remove( dbName: string ): boolean {
        return this._cache.delete( dbName );
    }

    clear(): void {
        this._cache.clear();
    }

}

/**
 * Query cache.
 * 
 * @author Thiago Delgado Pinto
 */
export class QueryCache {

    // query => [ { field1 => value1, field2 => value2, ... }, { ... } ]
    // ex: 'SELECT bla' => [ { 'col1': 'valA', 'col2': 'valB' }, { 'col1': 'valC', 'col2': 'valD' } ]
    private _cache: Map< string, Map< string, any >[] > = new Map< string, Map< string, any >[] >();

    has( query: string ): boolean {
        return this._cache.has( query );
    }    

    put( query: string, values: Map< string, any >[] ): void {
        this._cache.set( query, values );
    }

    get( query: string ): Map< string, any >[] {
        return this._cache.get( query );
    }

    remove( query: string ): boolean {
        return this._cache.delete( query );
    }

    clear(): void {
        this._cache.clear();
    }

}