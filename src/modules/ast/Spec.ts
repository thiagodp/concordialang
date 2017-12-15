import { Feature } from './Feature';
import { Table } from './Table';
import { ReservedTags } from '../req/ReservedTags';
import { NodeTypes } from '../req/NodeTypes';
import { Tag } from './Tag';
import { UIElement } from './UIElement';
import { Constant } from './Constant';
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

    private _databaseCache: Database[] = null;
    private _constantCache: Constant[] = null;
    private _tableCache: Table[] = null;
    private _featureCache: Feature[] = null;
    //private _uiElementCache: UIElement[] = null;

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
    public databases = ( clearCache: boolean = false ): Database[] => {
        if ( this._databaseCache !== null && ! clearCache ) {
            return this._databaseCache;
        }
        this._databaseCache = [];
        for ( let doc of this.docs ) {
            if ( ! doc.databases ) {
                continue;
            }
            for ( let db of doc.databases ) {
                let loc = db.location;

                // Adjust the file path, to be used in the future (e.g. for the query checker)
                loc.filePath = ! loc.filePath && doc.fileInfo ? doc.fileInfo.path : loc.filePath;

                this._databaseCache.push( db );
            }
        }
        return this._databaseCache;
    };


    public databaseNames = (): string[] => {
        return this.databases().map( db => db.name );
    };


    public constants = ( clearCache: boolean = false ): Constant[] => {
        if ( this._constantCache !== null && ! clearCache ) {
            return this._constantCache;
        }
        this._constantCache = [];
        for ( let doc of this.docs ) {
            if ( ! doc.constantBlock || ! doc.constantBlock.items || doc.constantBlock.items.length < 1 ) {
                continue;
            }
            for ( let ct of doc.constantBlock.items ) {
                this._constantCache.push( ct );
            }
        }
        return this._constantCache;        
    };

    public constantNames = (): string[] => {
        return this.constants().map( c => c.name );
    };


    public tables = ( clearCache: boolean = false ): Table[] => {
        if ( this._tableCache !== null && ! clearCache ) {
            return this._tableCache;
        }
        this._tableCache = [];
        for ( let doc of this.docs ) {
            if ( ! doc.tables || doc.tables.length < 1 ) {
                continue;
            }
            for ( let tbl of doc.tables ) {
                this._tableCache.push( tbl );
            }
        }
        return this._tableCache;        
    };    

    public tableNames = (): string[] => {
        return this.tables().map( c => c.name );
    };


    public features = ( clearCache: boolean = false ): Feature[] => {
        if ( this._featureCache !== null && ! clearCache ) {
            return this._featureCache;
        }
        this._featureCache = [];
        for ( let doc of this.docs ) {
            if ( ! doc.feature ) {
                continue;
            }
            this._featureCache.push( doc.feature );
        }
        return this._featureCache;
    };

    public featureWithName( name: string, ignoreCase: boolean = false ): Feature | null {
        if ( ! name ) {
            return null;
        }
        const features = this.features();
        for ( let f of features ) {

            const equal: boolean = ignoreCase
                ? name.toLowerCase() === f.name.toLowerCase()
                : name === f.name;
                
            if ( equal ) {
                return f;
            }
        }
        return null;
    }




    // public uiElements = ( clearCache: boolean = false ): UIElement[] => {
    //     if ( this._uiElementCache !== null && ! clearCache ) {
    //         return this._uiElementCache;
    //     }
    //     this._uiElementCache = [];
    //     for ( let doc of this.docs ) {
    //         const elements = this.globalUIElementsOf( doc );
    //         this._uiElementCache.push.apply( this._uiElementCache, elements );
    //     }
    //     return this._uiElementCache;        
    // };

    // public uiElementNames = (): string[] => {
    //     return this.uiElements().map( e => e.name );
    // };



    // // TO-DO: refactor to Document
    // private globalUIElementsOf = ( doc: Document ): UIElement[] => {
    //     if ( ! doc.uiElements || doc.uiElements.length < 1 ) {
    //         return [];
    //     }
    //     return doc.uiElements.filter(
    //         uie => this.globalTagsOf( uie ).length > 0 );
    // };

    // // TO-DO: refactor to UIElement
    // private globalTagsOf = ( uie: UIElement ): Tag[] => {
    //     if ( ! uie.tags || uie.tags.length < 1 ) {
    //         return [];
    //     }
    //     return uie.tags.filter( t => this.isGlobalTag( t ) );
    // };

    // // TO-DO: refactor to Tag
    // private isGlobalTag = ( tag: Tag ): boolean => {
    //     return tag.name === ReservedTags.GLOBAL;
    // };

}