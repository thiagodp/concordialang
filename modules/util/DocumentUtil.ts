import { isDefined, areDefined } from "./TypeChecking";
import { Document } from '../ast/Document';
import { hasTagNamed } from "../ast/Tag";
import { ReservedTags } from "../req/ReservedTags";
import { Variant } from "../ast/Variant";
import { Scenario } from "../ast/Scenario";
import { UIElement } from "../ast/UIElement";
import { Feature } from "../ast/Feature";
import { CaseType } from "../app/CaseType";
import { UIElementNameHandler } from "./UIElementNameHandler";
import { UIElementPropertyExtractor } from "./UIElementPropertyExtractor";

export class DocumentUtil {

    private readonly _uieNameHandler = new UIElementNameHandler();
    private readonly _uiePropExtractor = new UIElementPropertyExtractor();


    mapVariantsOf( doc: Document ): Map< Variant, Scenario > {

        let map = new Map< Variant, Scenario >();

        if ( ! areDefined( doc.feature, doc.feature.scenarios ) ) {
            return map;
        }

        for ( let sc of doc.feature.scenarios ) {
            for ( let v of sc.variants || [] ) {
                map.set( v, sc );
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
    findUIElementInTheDocument( variable: string, doc: Document ): UIElement | null {

        const [ featureName, uiElementName ] = this._uieNameHandler.extractNamesOf( variable );

        if ( isDefined( featureName ) )  {

            if ( ! isDefined( doc.feature ) ) {
                return null; // not in this document
            }

            if ( featureName.toLowerCase() !== doc.feature.name.toLowerCase() ) {
                return null; // feature names are different
            }

        }
        // Document has feature with ui elements ?
        if ( areDefined( doc.feature, doc.feature.uiElements ) ) {
            // Let's search it in the feature
            for ( let uie of doc.feature.uiElements ) {
                if ( uie.name.toLowerCase() === uiElementName.toLowerCase() ) {
                    return uie;
                }
            }
        }

        // Finally let's search it in the document
        for ( let uie of doc.uiElements || [] ) {
            if ( uie.name.toLowerCase() === uiElementName.toLowerCase() ) {
                return uie;
            }
        }

        return null; // not found
    }


    findUIElementInfoInTheDocument( variable: string, doc: Document, caseOption: CaseType | string = CaseType.CAMEL  ): UIElementInfo | null {
        const uie = this.findUIElementInTheDocument( variable, doc );
        if ( isDefined( uie ) ) {
            return new UIElementInfo( doc, uie, this._uiePropExtractor.extractId( uie, caseOption ), doc.feature || null );
        }
        return null;
    }

    /**
     * Adds all the UI Element variables of the given document to the given map.
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
    addUIElementsVariablesOf(
        doc: Document,
        map: Map< string, UIElementInfo >,
        keepItLocal: boolean = false,
        caseOption: CaseType | string = CaseType.CAMEL
    ): void {
        // Start with global ui elements
        for ( let uie of doc.uiElements || [] ) {
            const uiLiteral: string = this._uiePropExtractor.extractId( uie, caseOption );
            map.set(
                this._uieNameHandler.makeVariableName( null, uie.name ),
                new UIElementInfo( doc, uie, uiLiteral, null )
            );
        }
        if ( ! isDefined( doc.feature ) ) {
            return;
        }
        // Then fill it with local ui elements
        for ( let uie of doc.feature.uiElements ) {
            const uiLiteral: string = this._uiePropExtractor.extractId( uie, caseOption );
            // When null, a feature name may overwrite a name defined globallly
            const featureName: string | null = ! keepItLocal ? doc.feature.name : null;
            map.set(
                this._uieNameHandler.makeVariableName( featureName, uie.name ),
                new UIElementInfo( doc, uie, uiLiteral, doc.feature )
            );
        }
    }

}


export class UIElementInfo {

    constructor(
        public document: Document = null,
        public uiElement: UIElement = null,
        public uiLiteral: string = null,
        public feature: Feature = null
    ) {
    }

    isGlobal(): boolean {
        return ! this.feature;
    }
}