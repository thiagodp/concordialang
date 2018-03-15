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
import { join, resolve, dirname } from 'path';
import { UIElementPropertyExtractor } from '../util/UIElementPropertyExtractor';
import { DocumentUtil, UIElementInfo } from '../util/DocumentUtil';
import { CaseType } from '../app/CaseType';

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
    private _uiElementCache: UIElement[] = null; // global UI Elements
    private _nonFeatureNamesCache: string[] = null;

    private _constantNameToValueMap: Map< string, string | number > = new Map< string, string | number >();
    private _uiElementVariableMap: Map< string, UIElementInfo > = new Map< string, UIElementInfo >(); // global UI Elements


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
    public docWithPath( filePath: string, referencePath: string = null, clearCache: boolean = false ): Document | null {

        let aPath = filePath;
        if ( isDefined( referencePath ) ) {
            aPath = resolve( dirname( referencePath ), filePath );
        }

        if ( ! isDefined( this._relPathToDocumentCache ) || clearCache ) {

            this._relPathToDocumentCache = new Map< string, Document >();

            // Fill cache
            for ( let doc of this.docs ) {

                const relDocPath = isDefined( this.basePath )
                    ? resolve( this.basePath, doc.fileInfo.path )
                    : doc.fileInfo.path;

                this._relPathToDocumentCache.set( relDocPath, doc );
            }
        }

        //console.log( 'checked:', filePath, 'ref:', referencePath, 'aPath:', aPath, '\nall:', this._relPathToDocumentCache.keys() );
        const relFilePath = isDefined( this.basePath ) ? resolve( this.basePath, aPath ) : aPath;
        return this._relPathToDocumentCache.get( relFilePath ) || null;
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
        return this.databases( clearCache )
            .find( db => db.name.toLowerCase() === name.toLowerCase() ) || null;
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
    public tables( clearCache: boolean = false ): Table[] {
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
    }

    public tableNames(): string[] {
        return this.tables().map( c => c.name );
    }


    /**
     * Return all features. Results are cached.
     */
    public features( clearCache: boolean = false ): Feature[] {
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
    }

    public featureNames(): string[] {
        return this.features().map( v => v.name );
    }

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

    public uiElements(
        clearCache: boolean = false,
        uiLiteralCaseOption: CaseType = CaseType.CAMEL
    ): UIElement[] {
        if ( this._uiElementCache !== null && ! clearCache ) {
            return this._uiElementCache;
        }
        this._uiElementCache = [];
        this._uiElementVariableMap.clear();
        const docUtil = new DocumentUtil();
        for ( let doc of this.docs ) {
            if ( ! doc.uiElements || doc.uiElements.length < 1 ) {
                continue;
            }
            // -- add all the variables of the document to the map
            docUtil.addUIElementsVariablesOf( doc, this._uiElementVariableMap, false, uiLiteralCaseOption );
            // --
            this._uiElementCache.push.apply( this._uiElementCache, doc.uiElements );
        }
        return this._uiElementCache;
    }


    /**
     * Returns a map with all the UI Elements of the specification. Global UI Elements have
     * no feature name, e.g., `globalName`, while non-global UI Elements have, e.g.,
     * `My Feature:My Element`.
     *
     * @param clearCache
     */
    public uiElementsVariableMap(
        clearCache: boolean = false,
        uiLiteralCaseOption: CaseType = CaseType.CAMEL
    ): Map< string, UIElementInfo > {
        if ( this._uiElementCache !== null && ! clearCache ) {
            this._uiElementVariableMap;
        }
        this.uiElements( clearCache, uiLiteralCaseOption );
        return this._uiElementVariableMap;
    }



    public findUIElementVariable(
        variable: string,
        doc: Document = null,
        uiLiteralCaseOption: CaseType = CaseType.CAMEL
    ): UIElementInfo | null {
        if ( isDefined( doc ) ) {
            const docUtil = new DocumentUtil();
            const info = docUtil.findUIElementInfoInTheDocument( variable, doc, uiLiteralCaseOption );
            if ( isDefined( info ) ) {
                return info;
            }
        }
        return this.uiElementsVariableMap( false, uiLiteralCaseOption ).get( variable ) || null;
    }

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