import { isDefined } from "./TypeChecking";
import { Document } from '../ast/Document';
import { hasTagNamed } from "../ast/Tag";
import { ReservedTags } from "../req/ReservedTags";
import { Variant } from "../ast/Variant";
import { Scenario } from "../ast/Scenario";
import { UIElement, UIElementInfo } from "../ast/UIElement";
import { Feature } from "../ast/Feature";
import { CaseType } from "../app/CaseType";
import { UIElementNameHandler } from "./UIElementNameHandler";
import { UIElementPropertyExtractor } from "./UIElementPropertyExtractor";

export class DocumentUtil {

    private readonly _uieNameHandler = new UIElementNameHandler();
    private readonly _uiePropExtractor = new UIElementPropertyExtractor();


    mapVariantsOf( doc: Document ): Map< Variant, Scenario > {

        let map = new Map< Variant, Scenario >();

        if ( ! isDefined( doc.feature ) ) {
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

        const lowerCasedUIElementName = uiElementName.toLowerCase();

        // Document has feature with ui elements ?
        if ( isDefined( doc.feature ) ) {
            // Let's search it in the feature
            for ( let uie of doc.feature.uiElements || [] ) {
                if ( uie.name.toLowerCase() === lowerCasedUIElementName ) {
                    return uie;
                }
            }
        }

        // Finally let's search it in the document
        for ( let uie of doc.uiElements || [] ) {
            if ( uie.name.toLowerCase() === lowerCasedUIElementName ) {
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
    mapUIElementVariables(
        doc: Document,
        map: Map< string, UIElement >,
        keepItLocal: boolean = false,
        caseOption: CaseType | string = CaseType.CAMEL
    ): void {

        // Start with global ui elements
        for ( let uie of doc.uiElements || [] ) {
            // Generates the UI Literal
            const uiLiteral: string = this._uiePropExtractor.extractId( uie, caseOption );
            // Creates the info if not defined
            if ( ! uie.info ) {
                uie.info = new UIElementInfo( doc, uiLiteral, null );
            }

            const variableName = this._uieNameHandler.makeVariableName( null, uie.name );
            uie.info.fullVariableName = variableName;

            // Maps the element
            map.set( variableName, uie );
        }

        if ( ! isDefined( doc.feature ) ) {
            return;
        }

        // Then fill it with local ui elements
        for ( let uie of doc.feature.uiElements || [] ) {

            // Generates the UI Literal
            const uiLiteral: string = this._uiePropExtractor.extractId( uie, caseOption );

            // When null, a feature name may overwrite a name defined globallly
            const featureName: string | null = ! keepItLocal ? doc.feature.name : null;

            // Creates the info if not defined
            if ( ! uie.info ) {
                uie.info = new UIElementInfo( doc, uiLiteral, doc.feature );
            }

            const variableName = this._uieNameHandler.makeVariableName( featureName, uie.name );
            uie.info.fullVariableName = variableName;

            // Maps the element
            map.set( variableName, uie );
        }
    }

}