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