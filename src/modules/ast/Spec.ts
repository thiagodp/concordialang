import { Database } from './Database';
import { Document } from './Document';
import * as path from 'path';
/**
 * Specification
 * 
 * @author Thiago Delgado Pinto
 */
export class Spec {

    basePath: string = null;

    docs: Document[] = [];

    private _databasesCache: Database[] = null;

    constructor( basePath?: string ) {
        this.basePath = basePath;
    }

    /**
     * Returns a document with the given path.
     * 
     * Both the given path and the path of available documents are 
     * normalized with relation to the base path, if the latter exists,
     * in order to increase the chances of matching.
     * 
     * @param filePath File path.
     */
    public docWithPath( filePath: string ): Document {
        const relPath = this.basePath ? path.join( this.basePath, filePath ) : filePath;
        for ( let doc of this.docs ) {
            const relDocPath = this.basePath
                ? path.join( this.basePath, doc.fileInfo.path )
                : doc.fileInfo.path;
            if ( relPath === relDocPath ) {
                return doc;
            }
        }
        return null;
    }

    /**
     * Return all databases. Results are cached.
     */
    public databases = (): Database[] => {
        if ( this._databasesCache !== null ) {
            return this._databasesCache;
        }
        this._databasesCache = [];
        for ( let doc of this.docs ) {
            if ( ! doc.databases ) {
                continue;
            }
            for ( let db of doc.databases ) {
                let loc = db.location;

                // Adjust the file path, to be used in the future (e.g. for the query checker)
                loc.filePath = ! loc.filePath && doc.fileInfo ? doc.fileInfo.path : loc.filePath;

                this._databasesCache.push( db );
            }
        }
        return this._databasesCache;
    };

    /**
     * Returns a database with the given name.
     * 
     * @param name Database name.
     * @return database
     */
    public databaseWithName = ( name: string ): Database => {
        const databases = this.databases();
        for ( const db of databases ) {
            if ( name === db.name ) {
                return db;
            }
        }
        return null;
    };

}