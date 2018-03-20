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
import { DocumentUtil } from '../util/DocumentUtil';
import { CaseType } from '../app/CaseType';
import { NamedNode } from './Node';
import { toEnumValue } from '../util/ToEnumValue';

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
    private _uiElementVariableMap: Map< string, UIElement > = new Map< string, UIElement >(); // *all* UI Elements

    private _uiLiteralCaseOption: CaseType = CaseType.CAMEL; // defined by setter


    constructor( basePath?: string ) {
        this.basePath = basePath;
    }


    get uiLiteralCaseOption(): CaseType {
        return this._uiLiteralCaseOption;
    }

    set uiLiteralCaseOption( option: CaseType ) {
        this._uiLiteralCaseOption = option;
    }


    clearCache() {
        this._relPathToDocumentCache = null;
        this._databaseCache = null;
        this._constantCache = null;
        this._tableCache = null;
        this._featureCache = null;
        this._uiElementCache = null;
        this._nonFeatureNamesCache = null;

        this._constantNameToValueMap.clear();
        this._uiElementVariableMap.clear();
    }

    //
    // CACHE FOR DOCUMENTS
    //

    mapDocumentDatabases( doc: Document ): void {
        if ( ! doc.databases || doc.databases.length < 1 ) {
            return;
        }

        if ( ! this._databaseCache ) {
            this._databaseCache = [];
        }

        for ( let db of doc.databases ) {

            // Adjust filePath if not defined
            if ( ! db.location.filePath && doc.fileInfo ) {
                db.location.filePath = doc.fileInfo.path || '';
            }

            this._databaseCache.push( db );
        }
    }

    mapDocumentConstants( doc: Document ): void {
        if ( ! doc.constantBlock || ! doc.constantBlock.items || doc.constantBlock.items.length < 1 ) {
            return;
        }

        if ( ! this._constantCache ) {
            this._constantCache = [];
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

    mapDocumentTables( doc: Document ): void {
        if ( ! doc.tables || doc.tables.length < 1 ) {
            return;
        }

        if ( ! this._tableCache ) {
            this._tableCache = [];
        }

        for ( let tbl of doc.tables ) {

            // Adjust filePath if not defined
            if ( ! tbl.location.filePath && doc.fileInfo ) {
                tbl.location.filePath = doc.fileInfo.path || '';
            }

            this._tableCache.push( tbl );
        }
    }

    mapDocumentFeatures( doc: Document ): void {
        if ( ! doc.feature ) {
            return;
        }

        if ( ! this._featureCache ) {
            this._featureCache = [];
        }

        // Adjust filePath if not defined
        if ( isDefined( doc.feature.location ) && ! isDefined( doc.feature.location.filePath ) && isDefined( doc.fileInfo ) ) {
            doc.feature.location.filePath = doc.fileInfo.path || '';
        }

        this._featureCache.push( doc.feature );
    }

    mapDocumentUIElementVariables( doc: Document ): void {

        // Maps local and global UI elements to the variables cache
        ( new DocumentUtil() ).mapUIElementVariables( doc, this._uiElementVariableMap, false, this._uiLiteralCaseOption );

        // Adds global UI elements to the UI elements cache, if defined
        if ( ! doc.uiElements || doc.uiElements.length < 1 ) {
            return;
        }

        if ( ! this._uiElementCache ) {
            this._uiElementCache = [];
        }

        this._uiElementCache.push.apply( this._uiElementCache, doc.uiElements );
    }


    mapEverythingFromDocument( doc: Document ): void {
        this.mapDocumentFeatures( doc );
        this.mapDocumentConstants( doc );
        this.mapDocumentDatabases( doc );
        this.mapDocumentTables( doc );
        this.mapDocumentUIElementVariables( doc );
    }

    //
    // FIND
    //


    /**
     * Returns a document with the given path or null if not found.
     *
     * Both the given path and the path of available documents are
     * normalized with relation to the base path, if the latter exists,
     * in order to increase the chances of matching.
     *
     * @param filePath File path.
     */
    docWithPath( filePath: string, referencePath: string = null, rebuildCache: boolean = false ): Document | null {

        let aPath = filePath;
        if ( isDefined( referencePath ) ) {
            aPath = resolve( dirname( referencePath ), filePath );
        }

        if ( ! isDefined( this._relPathToDocumentCache ) || rebuildCache ) {

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


    constantWithName( name: string, rebuildCache: boolean = false ): Constant | null {
        return this.findByName( name, this.constants( rebuildCache ) );
    }

    tableWithName( name: string, rebuildCache: boolean = false ): Table | null {
        return this.findByName( name, this.tables( rebuildCache ) );
    }

    databaseWithName( name: string, rebuildCache: boolean = false ): Database | null {
        return this.findByName( name, this.databases( rebuildCache ) );
    }

    featureWithName( name: string, rebuildCache: boolean = false ): Feature | null {
        return this.findByName( name, this.features( rebuildCache ) );
    }

    uiElementByVariable(
        variable: string,
        doc: Document = null
    ): UIElement | null {
        if ( isDefined( doc ) ) {
            const docUtil = new DocumentUtil();
            const ui = docUtil.findUIElementInTheDocument( variable, doc );
            if ( isDefined( ui ) ) {
                return ui;
            }
        }
        return this.uiElementsVariableMap( false ).get( variable ) || null;
    }


    private findByName< T extends NamedNode >( name: string, nodes: T[] ): T | null {
        const lowerCasedName: string = name.toLowerCase();
        return nodes.find( n => n.name.toLowerCase() === lowerCasedName ) || null;
    }

    //
    // OTHER
    //

    constantValue( name: string ): string | number | null {
        return this.constantNameToValueMap().get( name ) || null;
    }

    /**
     * Return all databases. Results are cached.
     */
    public databases( rebuildCache: boolean = false ): Database[] {
        if ( isDefined( this._databaseCache ) && ! rebuildCache ) {
            return this._databaseCache;
        }
        this._databaseCache = [];
        for ( let doc of this.docs ) {
            this.mapDocumentDatabases( doc );
        }
        return this._databaseCache;
    }


    public databaseNames = ( rebuildCache: boolean = false ): string[] => {
        return this.databases( rebuildCache ).map( db => db.name );
    };


    public isConstantCacheFilled(): boolean {
        return isDefined( this._constantCache );
    }

    /**
     * Return all constants. Results are cached.
     */
    public constants( rebuildCache: boolean = false ): Constant[] {
        if ( this.isConstantCacheFilled() && ! rebuildCache ) {
            return this._constantCache;
        }
        return this.fillConstantsCache();
    }

    private fillConstantsCache(): Constant[] {
        this._constantCache = [];
        for ( let doc of this.docs ) {
            this.mapDocumentConstants( doc );
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


    /**
     * Return all tables. Results are cached.
     */
    public tables( rebuildCache: boolean = false ): Table[] {
        if ( isDefined( this._tableCache ) && ! rebuildCache ) {
            return this._tableCache;
        }
        this._tableCache = [];
        for ( let doc of this.docs ) {
            this.mapDocumentTables( doc );
        }
        return this._tableCache;
    }

    public tableNames(): string[] {
        return this.tables().map( c => c.name );
    }


    /**
     * Return all features. Results are cached.
     */
    public features( rebuildCache: boolean = false ): Feature[] {
        if ( isDefined( this._featureCache ) && ! rebuildCache ) {
            return this._featureCache;
        }
        this._featureCache = [];
        for ( let doc of this.docs ) {
            this.mapDocumentFeatures( doc );
        }
        return this._featureCache;
    }

    public featureNames(): string[] {
        return this.features().map( v => v.name );
    }

    public nonFeatureNames( rebuildCache: boolean = false ): string[] {
        if ( this._nonFeatureNamesCache !== null && ! rebuildCache ) {
            return this._nonFeatureNamesCache;
        }
        this._nonFeatureNamesCache = [];
        this._nonFeatureNamesCache.push.apply( this._nonFeatureNamesCache, this.databaseNames() );
        this._nonFeatureNamesCache.push.apply( this._nonFeatureNamesCache, this.tableNames() );
        this._nonFeatureNamesCache.push.apply( this._nonFeatureNamesCache, this.constantNames() );
        return this._nonFeatureNamesCache;
    }

    public uiElements( rebuildCache: boolean = false ): UIElement[] {
        if ( this._uiElementCache !== null && ! rebuildCache ) {
            return this._uiElementCache;
        }
        this._uiElementCache = [];
        this._uiElementVariableMap.clear();
        for ( let doc of this.docs ) {
            this.mapDocumentUIElementVariables( doc );
        }
        return this._uiElementCache;
    }


    /**
     * Returns a map with all the UI Elements of the specification. Global UI Elements have
     * no feature name, e.g., `globalName`, while non-global UI Elements have, e.g.,
     * `My Feature:My Element`.
     *
     * @param rebuildCache
     */
    public uiElementsVariableMap( rebuildCache: boolean = false ): Map< string, UIElement > {
        if ( this._uiElementCache !== null && ! rebuildCache ) {
            this._uiElementVariableMap;
        }
        this.uiElements( rebuildCache );
        return this._uiElementVariableMap;
    }

}