import { DatabaseInterface } from "../dbi/DatabaseInterface";

/**
 * Connection cache.
 *
 * @author Thiago Delgado Pinto
 */
export class ConnectionCache {

    private _cache: Map< string, DatabaseInterface > = new Map< string, DatabaseInterface >();

    has( dbName: string ): boolean {
        return this._cache.has( dbName );
    }

    put( dbName: string, value: DatabaseInterface ): void {
        this._cache.set( dbName, value );
    }

    get( dbName: string ): DatabaseInterface | null {
        return this._cache.get( dbName );
    }

    remove( dbName: string ): boolean {
        return this._cache.delete( dbName );
    }

    clear(): void {
        this._cache.clear();
    }

}