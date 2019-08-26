import { dirname, resolve } from 'path';

import {
    Spec,
    Constant,
    Database,
    Document,
    Feature,
    NamedNode,
    Table,
    UIElement
} from '../ast';
import { DatabaseInterface, InMemoryTableInterface } from '../dbi';
import { CaseType } from '../app/CaseType';
import { DocumentUtil } from '../util/DocumentUtil';
import { isDefined, valueOrNull } from '../util/TypeChecking';
import { UIElementNameHandler } from '../util/UIElementNameHandler';

class MappedContent {
    feature: boolean = false;
    database: boolean = false;
    constant: boolean = false;
    uiElement: boolean = false;
    table: boolean = false;
}

export const IN_MEMORY_DATABASE_NAME: string = '___concordia___';

/**
 * Augmented specification
 *
 * @author Thiago Delgado Pinto
 */
export class AugmentedSpec extends Spec {

    private _docFullyMapped = new Map< Document, MappedContent >() ;

    private _relPathToDocumentCache: Map< string, Document > = null;

    private _databaseCache: Database[] = null;
    private _constantCache: Constant[] = null;
    private _tableCache: Table[] = null;
    private _featureCache: Feature[] = null;
    private _uiElementCache: UIElement[] = null; // global UI Elements
    private _nonFeatureNamesCache: string[] = null;

    private _constantNameToValueMap: Map< string, string | number > = new Map< string, string | number >();
    private _uiElementVariableMap: Map< string, UIElement > = new Map< string, UIElement >(); // *all* UI Elements

    private _databaseNameToInterfaceMap = new Map< string, DatabaseInterface | null >();

    private _uiLiteralCaseOption: CaseType = CaseType.CAMEL; // defined by setter

    private _docToAcessibleUIElementsCache = new Map< Document, UIElement[] >();


    constructor( basePath?: string ) {
        super( basePath );
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

        this._databaseNameToInterfaceMap.clear();

        this._docFullyMapped.clear();
    }

    mapAllDocuments() {
        for ( let doc of this.docs ) {
            this.mapEverythingFromDocument( doc );
        }
    }



    private assureDoc( doc: Document ): MappedContent {
        let mc = this._docFullyMapped.get( doc );
        if ( ! isDefined( mc ) ) {
            mc = new MappedContent();
            this._docFullyMapped.set( doc, mc );
        }
        return mc;
    }

    //
    // CACHE FOR CONNECTIONS
    //

    databaseNameToInterfaceMap(): Map< string, DatabaseInterface | null > {
        return this._databaseNameToInterfaceMap;
    }

    //
    // CACHE FOR DOCUMENTS
    //

    mapDocumentDatabases( doc: Document ): void {
        if ( ! doc || this.assureDoc( doc ).database ) {
            return;
        }

        if ( ! doc.databases ) {
            this.assureDoc( doc ).database = true;
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

        this.assureDoc( doc ).database = true;
    }

    mapDocumentConstants( doc: Document ): void {
        if ( ! doc || this.assureDoc( doc ).constant ) {
            return;
        }

        if ( ! doc.constantBlock || ! doc.constantBlock.items ) {
            this.assureDoc( doc ).constant = true;
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

        this.assureDoc( doc ).constant = true;
    }

    mapDocumentTables( doc: Document ): void {
        if ( ! doc ||  this.assureDoc( doc ).table ) {
            return;
        }

        if ( ! doc.tables ) {
            this.assureDoc( doc ).table = true;
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

        this.assureDoc( doc ).table = true;
    }

    mapDocumentFeatures( doc: Document ): void {
        if ( ! doc || this.assureDoc( doc ).feature ) {
            return;
        }

        if ( ! doc.feature ) {
            this.assureDoc( doc ).feature = true;
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

        this.assureDoc( doc ).feature = true;
    }

    mapDocumentUIElementVariables( doc: Document ): void {

        if ( ! doc || this.assureDoc( doc ).uiElement ) {
            return;
        }

        // Maps local and global UI elements to the variables cache
        ( new DocumentUtil() ).mapUIElementVariables( doc, this._uiElementVariableMap, false, this._uiLiteralCaseOption );

        // Adds global UI elements to the UI elements cache, if defined
        if ( ! doc.uiElements || doc.uiElements.length < 1 ) {
            this.assureDoc( doc ).uiElement = true;
            return;
        }

        if ( ! this._uiElementCache ) {
            this._uiElementCache = [];
        }

        this._uiElementCache.push.apply( this._uiElementCache, doc.uiElements );

        this.assureDoc( doc ).uiElement = true;
    }


    mapEverythingFromDocument( doc: Document ): void {
        if ( ! doc ) {
            return;
        }
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
     *
     * @param referencePath Reference path is the path from where the file was read,
     *                      e.g., the one stored in doc.fileInfo.path. Since a file
     *                      can be imported from different places, the path from where
     *                      is was read is important to resolve its relative path.
     *
     * @param rebuildCache Whether it is desired to erase the cache and rebuild it. Defaults to false.
     */
    docWithPath( filePath: string, referencePath: string = '.', rebuildCache: boolean = false ): Document | null {

        // Rebuild cache ?
        if ( ! isDefined( this._relPathToDocumentCache ) || rebuildCache ) {
            this._relPathToDocumentCache = new Map< string, Document >();
            for ( let doc of this.docs ) {
                this._relPathToDocumentCache.set( doc.fileInfo.path.toLowerCase(), doc );
            }
        }

        const targetFile = resolve( dirname( referencePath ), filePath ).toLowerCase();
        let doc = this._relPathToDocumentCache.get( targetFile );
        return undefined === doc ? null : doc;
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
            return this.findUIElementInDocumentImports( variable, doc );
        }
        return this.uiElementsVariableMap( false ).get( variable ) || null;
    }


    private findByName< T extends NamedNode >( name: string, nodes: T[] ): T | null {
        const lowerCasedName: string = name.toLowerCase();
        return valueOrNull( nodes.find( n => n.name.toLowerCase() === lowerCasedName ) );
    }

    //
    // OTHER
    //

    constantValue( name: string ): string | number | null {
        return valueOrNull( this.constantNameToValueMap().get( name ) );
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


    /**
     * Find a UI Element in the imported files and returns it. Returns null if not found.
     *
     * @param variable Variable to find.
     * @param doc Document with the imports.
     */
    findUIElementInDocumentImports( variable: string, doc: Document ): UIElement | null {

        if ( ! doc.imports || doc.imports.length < 1 ) {
            return null;
        }

        const uieNameHandler = new UIElementNameHandler()
        const [ featureName, uiElementName ] = uieNameHandler.extractNamesOf( variable );
        if ( ! isDefined( featureName ) && doc.imports.length > 1 ) {
            return null;
        }

        const docUtil = new DocumentUtil();
        for ( let impDoc of doc.imports ) {
            let otherDoc = this.docWithPath( impDoc.value, doc.fileInfo.path );
            if ( ! otherDoc ) {
                // console.log( 'WARN: Imported document not found:', impDoc.value );
                // console.log( 'Base path is', this.basePath || '.' );
                continue;
            }
            let uie = docUtil.findUIElementInTheDocument( variable, otherDoc );
            if ( isDefined( uie ) ) {
                return uie;
            }
        }
        return null;
    }

    importedDocumentsOf( doc: Document ): Document[] {
        let docs: Document[] = [];
        for ( let impDoc of doc.imports || [] ) {
            let otherDoc = this.docWithPath( impDoc.value, doc.fileInfo.path );
            if ( ! otherDoc ) {
                continue;
            }
            docs.push( otherDoc );
        }
        return docs;
    }


    /**
     * Extract variables from a document and its imports.
     *
     * @param doc Document
     * @param includeGlobals Whether globals should be included
     */
    extractVariablesFromDocumentAndImports( doc: Document, includeGlobals: boolean = false ): string[] {
        const docUtil = new DocumentUtil();
        let variables: string[] = [];
        variables.push.apply( variables, docUtil.extractDocumentVariables( doc, includeGlobals ) );
        for ( let impDoc of doc.imports || [] ) {
            let otherDoc = this.docWithPath( impDoc.value, doc.fileInfo.path );
            if ( ! otherDoc ) {
                continue;
            }
            variables.push.apply( variables, docUtil.extractDocumentVariables( otherDoc, includeGlobals ) );
        }
        return variables;
    }

    /**
     * Extract UI elements from a document and its imports.
     *
     * @param doc Document
     * @param includeGlobals Whether globals should be included
     */
    extractUIElementsFromDocumentAndImports( doc: Document, includeGlobals: boolean = false ): UIElement[] {
        let elements: UIElement[] = this._docToAcessibleUIElementsCache.get( doc ) || null;
        if ( isDefined( elements ) ) {
            return elements;
        }
        const docUtil = new DocumentUtil();
        elements = [];
        elements.push.apply( elements, docUtil.extractUIElements( doc, includeGlobals ) );
        for ( let impDoc of doc.imports || [] ) {
            let otherDoc = this.docWithPath( impDoc.value, doc.fileInfo.path );
            if ( ! otherDoc ) {
                continue;
            }
            elements.push.apply( elements, docUtil.extractUIElements( otherDoc, includeGlobals ) );
        }
        return elements;
    }

}