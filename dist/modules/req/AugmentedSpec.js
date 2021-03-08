"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AugmentedSpec = exports.IN_MEMORY_DATABASE_NAME = void 0;
const path_1 = require("path");
const CaseType_1 = require("../util/CaseType");
const ast_1 = require("../ast");
const DocumentUtil_1 = require("../util/DocumentUtil");
const file_1 = require("../util/file");
const TypeChecking_1 = require("../util/TypeChecking");
const UIElementNameHandler_1 = require("../util/UIElementNameHandler");
class MappedContent {
    constructor() {
        this.feature = false;
        this.database = false;
        this.constant = false;
        this.uiElement = false;
        this.table = false;
    }
}
exports.IN_MEMORY_DATABASE_NAME = '___concordia___';
/**
 * Augmented specification
 *
 * TO-DO: Refactor !
 *
 * @author Thiago Delgado Pinto
 */
class AugmentedSpec extends ast_1.Spec {
    constructor(basePath) {
        super(basePath);
        this._docFullyMapped = new Map();
        this._pathToDocCache = new Map();
        this._databaseCache = null;
        this._constantCache = null;
        this._tableCache = null;
        this._featureCache = null;
        this._uiElementCache = null; // global UI Elements
        this._nonFeatureNamesCache = null;
        this._constantNameToValueMap = new Map();
        this._uiElementVariableMap = new Map(); // *all* UI Elements
        this._databaseNameToInterfaceMap = new Map();
        this._uiLiteralCaseOption = CaseType_1.CaseType.CAMEL; // defined by setter
        this._docToAccessibleUIElementsCache = new Map();
        this.databaseNames = (rebuildCache = false) => {
            return this.databases(rebuildCache).map(db => db.name);
        };
    }
    get uiLiteralCaseOption() {
        return this._uiLiteralCaseOption;
    }
    set uiLiteralCaseOption(option) {
        this._uiLiteralCaseOption = option;
    }
    clearCache(clearPathToDocCache = false) {
        if (clearPathToDocCache) {
            this._pathToDocCache.clear();
        }
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
        for (let doc of this.docs) {
            this.mapEverythingFromDocument(doc);
        }
    }
    addDocument(...docs) {
        for (const doc of docs) {
            if (this.addToDocPath(doc)) {
                this.docs.push(doc);
                this.mapEverythingFromDocument(doc);
            }
        }
    }
    indexOfDocWithPath(path) {
        const formattedPath = this.formatPath(path);
        const doc = this._pathToDocCache.get(formattedPath) || null;
        return doc ? this.docs.indexOf(doc) : -1;
    }
    replaceDocByIndex(index, newDoc) {
        const path = newDoc.fileInfo.path;
        const pathIndex = this.indexOfDocWithPath(path);
        if (pathIndex != index) {
            return false;
        }
        this.docs.splice(index, 1, newDoc); // Replace
        const formattedPath = this.formatPath(path);
        this._pathToDocCache.set(formattedPath, newDoc); // Overwrite cache
        return true;
    }
    formatPath(path) {
        return file_1.toUnixPath(path_1.resolve(path_1.dirname(this.basePath), path)).toLowerCase();
        // return toUnixPath( resolve( dirname( this.basePath ), path ) );
    }
    addToDocPath(doc) {
        var _a;
        const path = this.formatPath(((_a = doc === null || doc === void 0 ? void 0 : doc.fileInfo) === null || _a === void 0 ? void 0 : _a.path) || '');
        if (this._pathToDocCache.has(path)) {
            return false;
        }
        this._pathToDocCache.set(path, doc);
        return true;
    }
    rebuildDocPath() {
        this._pathToDocCache.clear();
        for (const doc of this.docs) {
            this.addToDocPath(doc);
        }
    }
    assureDoc(doc) {
        let mc = this._docFullyMapped.get(doc);
        if (!TypeChecking_1.isDefined(mc)) {
            mc = new MappedContent();
            this._docFullyMapped.set(doc, mc);
        }
        return mc;
    }
    //
    // CACHE FOR CONNECTIONS
    //
    databaseNameToInterfaceMap() {
        return this._databaseNameToInterfaceMap;
    }
    //
    // CACHE FOR DOCUMENTS
    //
    mapDocumentDatabases(doc) {
        if (!doc || this.assureDoc(doc).database) {
            return;
        }
        if (!doc.databases) {
            this.assureDoc(doc).database = true;
            return;
        }
        if (!this._databaseCache) {
            this._databaseCache = [];
        }
        for (let db of doc.databases) {
            // Adjust filePath if not defined
            if (!db.location.filePath && doc.fileInfo) {
                db.location.filePath = doc.fileInfo.path || '';
            }
            this._databaseCache.push(db);
        }
        this.assureDoc(doc).database = true;
    }
    mapDocumentConstants(doc) {
        if (!doc || this.assureDoc(doc).constant) {
            return;
        }
        if (!doc.constantBlock || !doc.constantBlock.items) {
            this.assureDoc(doc).constant = true;
            return;
        }
        if (!this._constantCache) {
            this._constantCache = [];
        }
        for (let ct of doc.constantBlock.items) {
            // Adjust filePath if not defined
            if (!ct.location.filePath && doc.fileInfo) {
                ct.location.filePath = doc.fileInfo.path || '';
            }
            this._constantCache.push(ct);
            this._constantNameToValueMap.set(ct.name, ct.value);
        }
        this.assureDoc(doc).constant = true;
    }
    mapDocumentTables(doc) {
        if (!doc || this.assureDoc(doc).table) {
            return;
        }
        if (!doc.tables) {
            this.assureDoc(doc).table = true;
            return;
        }
        if (!this._tableCache) {
            this._tableCache = [];
        }
        for (let tbl of doc.tables) {
            // Adjust filePath if not defined
            if (!tbl.location.filePath && doc.fileInfo) {
                tbl.location.filePath = doc.fileInfo.path || '';
            }
            this._tableCache.push(tbl);
        }
        this.assureDoc(doc).table = true;
    }
    mapDocumentFeatures(doc) {
        if (!doc || this.assureDoc(doc).feature) {
            return;
        }
        if (!doc.feature) {
            this.assureDoc(doc).feature = true;
            return;
        }
        if (!this._featureCache) {
            this._featureCache = [];
        }
        // Adjust filePath if not defined
        if (TypeChecking_1.isDefined(doc.feature.location) && !TypeChecking_1.isDefined(doc.feature.location.filePath) && TypeChecking_1.isDefined(doc.fileInfo)) {
            doc.feature.location.filePath = doc.fileInfo.path || '';
        }
        this._featureCache.push(doc.feature);
        this.assureDoc(doc).feature = true;
    }
    mapDocumentUIElementVariables(doc) {
        if (!doc || this.assureDoc(doc).uiElement) {
            return;
        }
        // Maps local and global UI elements to the variables cache
        (new DocumentUtil_1.DocumentUtil()).mapUIElementVariables(doc, this._uiElementVariableMap, false, this._uiLiteralCaseOption);
        // Adds global UI elements to the UI elements cache, if defined
        if (!doc.uiElements || doc.uiElements.length < 1) {
            this.assureDoc(doc).uiElement = true;
            return;
        }
        if (!this._uiElementCache) {
            this._uiElementCache = [];
        }
        this._uiElementCache.push.apply(this._uiElementCache, doc.uiElements);
        this.assureDoc(doc).uiElement = true;
    }
    mapEverythingFromDocument(doc) {
        if (!doc) {
            return;
        }
        this.mapDocumentFeatures(doc);
        this.mapDocumentConstants(doc);
        this.mapDocumentDatabases(doc);
        this.mapDocumentTables(doc);
        this.mapDocumentUIElementVariables(doc);
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
    docWithPath(filePath, referencePath = '.', rebuildCache = false) {
        // Rebuild cache ?
        if (!TypeChecking_1.isDefined(this._pathToDocCache) || rebuildCache) {
            this.rebuildDocPath();
        }
        const path = path_1.resolve(path_1.dirname(referencePath), filePath);
        const targetFile = this.formatPath(path);
        let doc = this._pathToDocCache.get(targetFile);
        return doc || null;
    }
    constantWithName(name, rebuildCache = false) {
        return this.findByName(name, this.constants(rebuildCache));
    }
    tableWithName(name, rebuildCache = false) {
        return this.findByName(name, this.tables(rebuildCache));
    }
    databaseWithName(name, rebuildCache = false) {
        return this.findByName(name, this.databases(rebuildCache));
    }
    featureWithName(name, rebuildCache = false) {
        return this.findByName(name, this.features(rebuildCache));
    }
    uiElementByVariable(variable, doc = null) {
        if (TypeChecking_1.isDefined(doc)) {
            const docUtil = new DocumentUtil_1.DocumentUtil();
            const ui = docUtil.findUIElementInTheDocument(variable, doc);
            if (TypeChecking_1.isDefined(ui)) {
                return ui;
            }
            return this.findUIElementInDocumentImports(variable, doc);
        }
        return this.uiElementsVariableMap(false).get(variable) || null;
    }
    findByName(name, nodes) {
        if (!name) {
            return null;
        }
        const lowerCasedName = name.toLowerCase();
        return TypeChecking_1.valueOrNull(nodes.find(n => n.name ? n.name.toLowerCase() === lowerCasedName : false));
    }
    //
    // OTHER
    //
    constantValue(name) {
        return TypeChecking_1.valueOrNull(this.constantNameToValueMap().get(name));
    }
    /**
     * Return all databases. Results are cached.
     */
    databases(rebuildCache = false) {
        if (TypeChecking_1.isDefined(this._databaseCache) && !rebuildCache) {
            return this._databaseCache;
        }
        this._databaseCache = [];
        for (let doc of this.docs) {
            this.mapDocumentDatabases(doc);
        }
        return this._databaseCache;
    }
    isConstantCacheFilled() {
        return TypeChecking_1.isDefined(this._constantCache);
    }
    /**
     * Return all constants. Results are cached.
     */
    constants(rebuildCache = false) {
        if (this.isConstantCacheFilled() && !rebuildCache) {
            return this._constantCache;
        }
        return this.fillConstantsCache();
    }
    fillConstantsCache() {
        this._constantCache = [];
        for (let doc of this.docs) {
            this.mapDocumentConstants(doc);
        }
        return this._constantCache;
    }
    constantNameToValueMap() {
        if (!this.isConstantCacheFilled()) {
            this.fillConstantsCache();
        }
        return this._constantNameToValueMap;
    }
    constantNames() {
        return [...this.constantNameToValueMap().keys()];
    }
    /**
     * Return all tables. Results are cached.
     */
    tables(rebuildCache = false) {
        if (TypeChecking_1.isDefined(this._tableCache) && !rebuildCache) {
            return this._tableCache;
        }
        this._tableCache = [];
        for (let doc of this.docs) {
            this.mapDocumentTables(doc);
        }
        return this._tableCache;
    }
    tableNames() {
        return this.tables().map(c => c.name);
    }
    /**
     * Return all features. Results are cached.
     */
    features(rebuildCache = false) {
        if (TypeChecking_1.isDefined(this._featureCache) && !rebuildCache) {
            return this._featureCache;
        }
        this._featureCache = [];
        for (let doc of this.docs) {
            this.mapDocumentFeatures(doc);
        }
        return this._featureCache;
    }
    featureNames() {
        return this.features().map(v => v.name);
    }
    nonFeatureNames(rebuildCache = false) {
        if (this._nonFeatureNamesCache !== null && !rebuildCache) {
            return this._nonFeatureNamesCache;
        }
        this._nonFeatureNamesCache = [];
        this._nonFeatureNamesCache.push.apply(this._nonFeatureNamesCache, this.databaseNames());
        this._nonFeatureNamesCache.push.apply(this._nonFeatureNamesCache, this.tableNames());
        this._nonFeatureNamesCache.push.apply(this._nonFeatureNamesCache, this.constantNames());
        return this._nonFeatureNamesCache;
    }
    uiElements(rebuildCache = false) {
        if (this._uiElementCache !== null && !rebuildCache) {
            return this._uiElementCache;
        }
        this._uiElementCache = [];
        this._uiElementVariableMap.clear();
        for (let doc of this.docs) {
            this.mapDocumentUIElementVariables(doc);
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
    uiElementsVariableMap(rebuildCache = false) {
        if (this._uiElementCache !== null && !rebuildCache) {
            return this._uiElementVariableMap;
        }
        this.uiElements(rebuildCache);
        return this._uiElementVariableMap;
    }
    /**
     * Find a UI Element in the imported files and returns it. Returns null if not found.
     *
     * @param variable Variable to find.
     * @param doc Document with the imports.
     */
    findUIElementInDocumentImports(variable, doc) {
        if (!doc.imports || doc.imports.length < 1) {
            return null;
        }
        const uieNameHandler = new UIElementNameHandler_1.UIElementNameHandler();
        const [featureName,] = uieNameHandler.extractNamesOf(variable);
        if (!TypeChecking_1.isDefined(featureName) && doc.imports.length > 1) {
            return null;
        }
        const docUtil = new DocumentUtil_1.DocumentUtil();
        for (let impDoc of doc.imports) {
            let otherDoc = this.docWithPath(impDoc.value, doc.fileInfo.path);
            if (!otherDoc) {
                // console.log(
                //     'WARNING - Imported document not found:', impDoc.value, "\n",
                //     'doc path:', doc.fileInfo.path, "\n",
                //     'Base path is', this.basePath || '.'
                // );
                continue;
            }
            let uie = docUtil.findUIElementInTheDocument(variable, otherDoc);
            if (TypeChecking_1.isDefined(uie)) {
                return uie;
            }
        }
        return null;
    }
    importedDocumentsOf(doc) {
        let docs = [];
        for (let impDoc of doc.imports || []) {
            let otherDoc = this.docWithPath(impDoc.value, doc.fileInfo.path);
            if (!otherDoc) {
                continue;
            }
            docs.push(otherDoc);
        }
        return docs;
    }
    /**
     * Extract variables from a document and its imports.
     *
     * @param doc Document
     * @param includeGlobals Whether globals should be included
     */
    extractVariablesFromDocumentAndImports(doc, includeGlobals = false) {
        const docUtil = new DocumentUtil_1.DocumentUtil();
        let variables = [];
        variables.push.apply(variables, docUtil.extractDocumentVariables(doc, includeGlobals));
        for (let impDoc of doc.imports || []) {
            let otherDoc = this.docWithPath(impDoc.value, doc.fileInfo.path);
            if (!otherDoc) {
                continue;
            }
            variables.push.apply(variables, docUtil.extractDocumentVariables(otherDoc, includeGlobals));
        }
        return variables;
    }
    /**
     * Extract UI elements from a document and its imports.
     *
     * @param doc Document
     * @param includeGlobals Whether globals should be included
     */
    extractUIElementsFromDocumentAndImports(doc, includeGlobals = false) {
        let elements = this._docToAccessibleUIElementsCache.get(doc) || null;
        if (TypeChecking_1.isDefined(elements)) {
            return elements;
        }
        const docUtil = new DocumentUtil_1.DocumentUtil();
        elements = [];
        elements.push.apply(elements, docUtil.extractUIElements(doc, includeGlobals));
        for (let impDoc of doc.imports || []) {
            let otherDoc = this.docWithPath(impDoc.value, doc.fileInfo.path);
            if (!otherDoc) {
                continue;
            }
            elements.push.apply(elements, docUtil.extractUIElements(otherDoc, includeGlobals));
        }
        return elements;
    }
}
exports.AugmentedSpec = AugmentedSpec;
