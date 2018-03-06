import { Feature } from './Feature';
import { Table } from './Table';
import { ReservedTags } from '../req/ReservedTags';
import { NodeTypes } from '../req/NodeTypes';
import { Tag } from './Tag';
import { UIElement } from './UIElement';
import { Constant } from './Constant';
import { Database, DatabaseProperties } from './Database';
import { Document } from './Document';
import { isDefined } from '../util/TypeChecking';
import { join } from 'path';

/**
 * Specification
 * 
 * @author Thiago Delgado Pinto
 */
export class Spec {

    basePath: string = null;

    docs: Document[] = [];

    private _relPathToDocumentCache: Map< string, Document > = null;

    private _databaseCache: Database[] = null;
    private _constantCache: Constant[] = null;
    private _tableCache: Table[] = null;
    private _featureCache: Feature[] = null;
    // private _uiElementCache: UIElement[] = null; // global UI Elements
    private _nonFeatureNamesCache: string[] = null;

    private _constantNameToValueMap: Map< string, string | number > = new Map< string, string | number >();



    constructor( basePath?: string ) {
        this.basePath = basePath;
    }

    /**
     * Returns a document with the given path or null if not found.
     * 
     * Both the given path and the path of available documents are 
     * normalized with relation to the base path, if the latter exists,
     * in order to increase the chances of matching.
     * 
     * @param filePath File path.
     */
    public docWithPath( filePath: string, clearCache: boolean = false ): Document | null {

        if ( ! isDefined( this._relPathToDocumentCache ) || clearCache ) {

            this._relPathToDocumentCache = new Map< string, Document >();

            // Fill cache
            for ( let doc of this.docs ) {

                const relDocPath = isDefined( this.basePath )
                    ? join( this.basePath, doc.fileInfo.path )
                    : doc.fileInfo.path;

                this._relPathToDocumentCache.set( relDocPath, doc );
            }            
        }       

        const relFilePath = isDefined( this.basePath ) ? join( this.basePath, filePath ) : filePath; 
        return this._relPathToDocumentCache.get( relFilePath )|| null;
    }

    /**
     * Return all databases. Results are cached.
     */
    public databases = ( clearCache: boolean = false ): Database[] => {
        if ( isDefined( this._databaseCache ) && ! clearCache ) {
            return this._databaseCache;
        }
        this._databaseCache = [];
        for ( let doc of this.docs ) {
            if ( ! doc.databases ) {
                continue;
            }
            for ( let db of doc.databases ) {

                // Adjust filePath if not defined
                if ( ! db.location.filePath && doc.fileInfo ) {
                    db.location.filePath = doc.fileInfo.path || '';
                }

                this._databaseCache.push( db );
            }
        }
        return this._databaseCache;
    };


    public databaseNames = ( clearCache: boolean = false ): string[] => {
        return this.databases( clearCache ).map( db => db.name );
    };

    public databaseWithName( name: string, clearCache: boolean = false ): Database | null {
        return this.databases( clearCache ).find( db => db.name.toLowerCase() === name.toLowerCase() );
    }


    public isConstantCacheFilled(): boolean {
        return isDefined( this._constantCache );
    }

    /**
     * Return all constants. Results are cached.
     */    
    public constants = ( clearCache: boolean = false ): Constant[] => {
        if ( this.isConstantCacheFilled() && ! clearCache ) {
            return this._constantCache;
        }
        return this.fillConstantsCache();       
    };

    private fillConstantsCache(): Constant[] {
        this._constantCache = [];
        for ( let doc of this.docs ) {
            if ( ! doc.constantBlock || ! doc.constantBlock.items || doc.constantBlock.items.length < 1 ) {
                continue;
            }
            for ( let ct of doc.constantBlock.items ) {

                // Adjust filePath if not defined
                if ( ! ct.location.filePath && doc.fileInfo ) {
                    ct.location.filePath = doc.fileInfo.path || '';
                }

                this._constantCache.push( ct );

                this._constantNameToValueMap.set( ct.name, ct.value );
            }
        }
        return this._constantCache;
    }

    public constantNameToValueMap(): Map< string, string | number > {
        if ( ! this.isConstantCacheFilled() ) {
            this.fillConstantsCache();
        }
        return this._constantNameToValueMap;        
    }

    public constantNames(): string[] {
        return [ ... this.constantNameToValueMap().keys() ];
    }

    public constantValue( name: string ): string | number | null {
        return this.constantNameToValueMap().get( name ) || null;
    }


    /**
     * Return all tables. Results are cached.
     */      
    public tables = ( clearCache: boolean = false ): Table[] => {
        if ( isDefined( this._tableCache ) && ! clearCache ) {
            return this._tableCache;
        }
        this._tableCache = [];
        for ( let doc of this.docs ) {
            if ( ! doc.tables || doc.tables.length < 1 ) {
                continue;
            }
            for ( let tbl of doc.tables ) {

                // Adjust filePath if not defined
                if ( ! tbl.location.filePath && doc.fileInfo ) {
                    tbl.location.filePath = doc.fileInfo.path || '';
                }

                this._tableCache.push( tbl );
            }
        }
        return this._tableCache;        
    };    

    public tableNames = (): string[] => {
        return this.tables().map( c => c.name );
    };


    /**
     * Return all features. Results are cached.
     */     
    public features = ( clearCache: boolean = false ): Feature[] => {
        if ( isDefined( this._featureCache ) && ! clearCache ) {
            return this._featureCache;
        }
        this._featureCache = [];
        for ( let doc of this.docs ) {
            if ( ! doc.feature ) {
                continue;
            }

            // Adjust filePath if not defined
            if ( ! doc.feature.location.filePath && doc.fileInfo ) {
                doc.feature.location.filePath = doc.fileInfo.path || '';
            }

            this._featureCache.push( doc.feature );
        }
        return this._featureCache;
    };

    public featureNames = (): string[] => {
        return this.features().map( v => v.name );
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


    public nonFeatureNames( clearCache: boolean = false ): string[] {
        if ( this._nonFeatureNamesCache !== null && ! clearCache ) {
            return this._nonFeatureNamesCache;
        }
        this._nonFeatureNamesCache = [];
        this._nonFeatureNamesCache.push.apply( this._nonFeatureNamesCache, this.databaseNames() );
        this._nonFeatureNamesCache.push.apply( this._nonFeatureNamesCache, this.tableNames() );
        this._nonFeatureNamesCache.push.apply( this._nonFeatureNamesCache, this.constantNames() );
        return this._nonFeatureNamesCache;
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