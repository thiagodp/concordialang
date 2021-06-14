import { CaseType } from './CaseType';
import { UIElementInfo } from '../ast';
import { isDefined } from './TypeChecking';
import { UIElementNameHandler } from './UIElementNameHandler';
import { UIElementPropertyExtractor } from './UIElementPropertyExtractor';
export class DocumentUtil {
    constructor() {
        this._uieNameHandler = new UIElementNameHandler();
        this._uiePropExtractor = new UIElementPropertyExtractor();
    }
    mapVariantsOf(doc) {
        let map = new Map();
        if (!isDefined(doc.feature)) {
            return map;
        }
        for (let sc of doc.feature.scenarios) {
            for (let v of sc.variants || []) {
                map.set(v, sc);
            }
        }
        return map;
    }
    /**
     * Finds a UI Element variable in the given document.
     *
     * The given name can have one of the following formats:
     * - feature:variable
     * - variable
     * - {feature:variable}
     * - {variable}
     *
     * @param variable UI Element variable name
     * @param doc Document
     */
    findUIElementInTheDocument(variable, doc) {
        const [featureName, uiElementName] = this._uieNameHandler.extractNamesOf(variable);
        if (isDefined(featureName)) {
            if (!isDefined(doc.feature)) {
                return null; // not in this document
            }
            if (featureName.toLowerCase() !== doc.feature.name.toLowerCase()) {
                return null; // feature names are different
            }
        }
        const lowerCasedUIElementName = uiElementName.toLowerCase();
        // Local UI element
        if (isDefined(doc.feature)) {
            // Let's search it in the feature
            for (let uie of doc.feature.uiElements || []) {
                if (uie.name.toLowerCase() === lowerCasedUIElementName) {
                    // Adds variable name if is does not have
                    if (!uie.info) {
                        uie.info = {};
                    }
                    if (!uie.info.fullVariableName) {
                        uie.info.fullVariableName = this._uieNameHandler.makeVariableName(doc.feature.name, uiElementName, false);
                    }
                    return uie;
                }
            }
        }
        // Global UI element
        for (let uie of doc.uiElements || []) {
            if (uie.name.toLowerCase() === lowerCasedUIElementName) {
                return uie;
            }
        }
        return null; // not found
    }
    /**
     * Adds all the UI Element variables of the given document to the given map. Every
     * UI Element found receives an UIElementInfo if not defined.
     *
     * Formats:
     * - {Element} for Global UI Elements and Feature's UI Elements if `keepItLocal` is true.
     * - {Feature:Element} for Feature's UI Elements if `keepItLocal` is false.
     *
     * @param doc Document
     * @param map Map
     * @param keepItLocal Whether UI Element variables should be created without the feature name.
     * @param caseOption Case option to generate ui literals
     */
    mapUIElementVariables(doc, map, keepItLocal = false, caseOption = CaseType.CAMEL) {
        if (!doc) {
            return;
        }
        // Start with global ui elements
        for (let uie of doc.uiElements || []) {
            // Generates the UI Literal
            const uiLiteral = this._uiePropExtractor.extractId(uie, caseOption);
            // Creates the info if not defined
            if (!uie.info) {
                uie.info = new UIElementInfo(doc, uiLiteral, null);
            }
            const variableName = this._uieNameHandler.makeVariableName(null, uie.name);
            uie.info.fullVariableName = variableName;
            // Maps the element
            map.set(variableName, uie);
        }
        if (!doc.feature) {
            return;
        }
        // Then fill it with local ui elements
        for (let uie of doc.feature.uiElements || []) {
            // Generates the UI Literal
            const uiLiteral = this._uiePropExtractor.extractId(uie, caseOption);
            // When null, a feature name may overwrite a name defined globallly
            const featureName = !keepItLocal ? doc.feature.name : null;
            // Creates the info if not defined
            if (!uie.info) {
                uie.info = new UIElementInfo(doc, uiLiteral, doc.feature);
            }
            const variableName = this._uieNameHandler.makeVariableName(featureName, uie.name);
            uie.info.fullVariableName = variableName;
            // Maps the element
            map.set(variableName, uie);
        }
    }
    // /**
    //  * Returns the language to use in the given document.
    //  *
    //  * @param doc Document
    //  * @param defaultLanguage Default language
    //  */
    // languageToUse( doc: Document, defaultLanguage: string ): string {
    //     return ! doc.language ? defaultLanguage : doc.language.value;
    // }
    extractDocumentVariables(doc, includeGlobals = false) {
        let variables = [];
        // Globals
        if (includeGlobals && (doc.uiElements || []).length > 0) {
            for (let uie of doc.uiElements) {
                variables.push(uie.name);
            }
        }
        // Locals
        const featureName = !doc.feature ? null : doc.feature.name;
        if (null === featureName) {
            return variables;
        }
        for (let uie of doc.feature.uiElements || []) {
            variables.push(this._uieNameHandler.makeVariableName(featureName, uie.name));
        }
        return variables;
    }
    extractUIElements(doc, includeGlobals = false) {
        let elements = [];
        // Globals
        if (includeGlobals && (doc.uiElements || []).length > 0) {
            for (let uie of doc.uiElements) {
                elements.push(uie);
            }
        }
        // Locals
        if (!doc.feature) {
            return elements;
        }
        for (let uie of doc.feature.uiElements || []) {
            elements.push(uie);
        }
        return elements;
    }
}
