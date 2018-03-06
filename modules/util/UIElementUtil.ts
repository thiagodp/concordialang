import { UIElement, UIProperty } from "../ast/UIElement";
import { CaseType } from "../app/CaseType";
import { isDefined } from "./TypeChecking";
import { Entities } from "../nlp/Entities";
import { NLPEntity } from "../nlp/NLPResult";
import { convertCase } from "./CaseConversor";

/**
 * Utilities for handling a UIElement.
 * 
 * @author Thiago Delgado Pinto 
 */
export class UIElementUtil {

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

    generateIds( uiElements: UIElement[], caseOption: CaseType | string ): Map< string, string > {
        let uiElementNameToLiteralMap: Map< string, string > = new Map< string, string >();
        for ( let uie of uiElements ) {
            uiElementNameToLiteralMap.set( uie.name, this.extractId( uie, caseOption ) );
        }
        return uiElementNameToLiteralMap;
    }

}