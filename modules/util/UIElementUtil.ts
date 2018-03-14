import { UIElement, UIProperty } from "../ast/UIElement";
import { CaseType } from "../app/CaseType";
import { isDefined } from "./TypeChecking";
import { Entities } from "../nlp/Entities";
import { NLPEntity } from "../nlp/NLPResult";
import { convertCase } from "./CaseConversor";
import { Symbols } from "../req/Symbols";

/**
 * Utilities for handling a UIElement.
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementUtil {

    /**
     * Extract the `id` property from a UI Element. If the property does not exist,
     * generates an id from the element name.
     *
     * @param uie UI Element
     * @param caseOption Case option
     */
    extractId( uie: UIElement, caseOption: CaseType | string ): string {
        // Find a property "id" in the UI element
        const item: UIProperty = uie.items ? uie.items.find( item => 'id' === item.property ) : null;
        if ( isDefined( item ) ) {
            // Find an entity "value" in the NLP result
            const entity = item.nlpResult.entities.find( ( e: NLPEntity ) => Entities.VALUE === e.entity );
            if ( isDefined( entity ) ) {
                return entity.value;
            }
        }
        // Use the UI_ELEMENT name as the id
        return convertCase( uie.name, caseOption );
    }

    /**
     * Generates a map from UI Elements names to their ids.
     *
     * @param uiElements
     * @param caseOption
     */
    generateIds( uiElements: UIElement[], caseOption: CaseType | string ): Map< string, string > {
        let uiElementNameToLiteralMap: Map< string, string > = new Map< string, string >();
        for ( let uie of uiElements ) {
            uiElementNameToLiteralMap.set( uie.name, this.extractId( uie, caseOption ) );
        }
        return uiElementNameToLiteralMap;
    }

    /**
     * Retrieves a feature name from a variable or null if not found.
     *
     * Accepted formats:
     * - feature:variable
     * - variable
     * - {feature:variable}
     * - {variable}
     *
     * @param variable Variable
     */
    public extractFeatureNameOf( variable: string ): string | null {
        const v = variable
            .replace( Symbols.UI_ELEMENT_PREFIX, '' )
            .replace( Symbols.UI_ELEMENT_SUFFIX, '' )
            .trim();
        const index =  v.indexOf( Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR );
        if ( index < 0 ) {
            return null;
        }
        return v.substring( 0, index );
    }

    /**
     * Retrieves a ui element name from a variable or null if not found.
     *
     * Accepted formats:
     * - feature:variable
     * - variable
     * - {feature:variable}
     * - {variable}
     *
     * @param variable Variable
     */
    public extractVariableNameOf( variable: string ): string {
        const v = variable
            .replace( Symbols.UI_ELEMENT_PREFIX, '' )
            .replace( Symbols.UI_ELEMENT_SUFFIX, '' )
            .trim();
        const index = v.indexOf( Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR );
        if ( index < 0 ) {
            return v;
        }
        if ( 1 === v.length ) { // separator only, e.g., {:}
            return null;
        }
        return v.split( Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR )[ 1 ];
    }

    /**
     * Makes a variable name.
     *
     * @param featureName Feature name
     * @param uiElementName UI Element name
     */
    public makeVariableName( featureName: string | null, uiElementName: string ): string {
        return Symbols.UI_ELEMENT_PREFIX +
            ( isDefined( featureName ) ? featureName + Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR : '' ) +
            uiElementName + Symbols.UI_ELEMENT_SUFFIX;
    }

}