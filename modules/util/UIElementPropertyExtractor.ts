import { UIElement, UIProperty } from "../ast/UIElement";
import { CaseType } from "../app/CaseType";
import { isDefined } from "./TypeChecking";
import { Entities } from "../nlp/Entities";
import { NLPEntity } from "../nlp/NLPResult";
import { convertCase } from "./CaseConversor";
import { UIPropertyTypes } from "./UIPropertyTypes";
import { ALL_VALUE_TYPES } from "./ValueTypeDetector";

/**
 * Extract properties from UI Elements.
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementPropertyExtractor {

    /**
     * Extract the `id` property from a UI Element. If the property does not exist,
     * generates an id from the element name.
     *
     * @param uie UI Element
     * @param caseOption Case option
     */
    extractId( uie: UIElement, caseOption: CaseType | string = CaseType.CAMEL ): string {
        // Find a property "id" in the UI element
        const item: UIProperty | null = this.extractProperty( uie, UIPropertyTypes.ID );
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

    extractType( uie: UIElement ): string {
        const nlpEntity = this.extractPropertyValueAsEntity( this.extractProperty( uie, UIPropertyTypes.TYPE ) );
        if ( ! isDefined( nlpEntity ) ) {
            return 'textbox'; // TODO: refactor
        }
        return nlpEntity.value;
    }

    extractDataType( uie: UIElement ): string {
        const defaultDataType = 'string'; // TODO: refactor

        const nlpEntity = this.extractPropertyValueAsEntity( this.extractProperty( uie, UIPropertyTypes.DATA_TYPE ) );
        if ( ! isDefined( nlpEntity ) ) {
            return defaultDataType;
        }

        // Assumes 'string' if the type is not expected
        const dataType: string = nlpEntity.value.toString().toLowerCase();
        if ( ALL_VALUE_TYPES.map( t => t.toString() ).indexOf( dataType ) < 0 ) {
            return defaultDataType;
        }
        return dataType;
    }

    extractIsEditable( uie: UIElement ): boolean {

        // Editable if it has the property 'editable' set to true
        const nlpEntity = this.extractPropertyValueAsEntity( this.extractProperty( uie, UIPropertyTypes.EDITABLE ) );
        if ( isDefined( nlpEntity ) ) {
            return this.isEntityConsideredTrue( nlpEntity );
        }

        // Or does not have the property 'editable' but have one of the following properties defined:
        const consideredAsEditable: string[] = [
            UIPropertyTypes.DATA_TYPE,
            UIPropertyTypes.MIN_LENGTH,
            UIPropertyTypes.MAX_LENGTH,
            UIPropertyTypes.MIN_VALUE,
            UIPropertyTypes.MAX_VALUE
        ];

        for ( let property of consideredAsEditable ) {
            if ( isDefined( this.extractProperty( uie, property ) ) ) {
                return true;
            }
        }
        return false;
    }

    extractIsRequired( uie: UIElement ): boolean {
        return this.isPropertyConsideredTrue( uie, UIPropertyTypes.REQUIRED );
    }


    isPropertyDefined( uie: UIElement, prop: string | UIPropertyTypes  ): boolean {
        return isDefined( this.extractProperty(
            uie,
            typeof prop === 'string' ? prop : prop.toString()
        ) );
    }


    isPropertyConsideredTrue( uie: UIElement, property: string ): boolean {
        const nlpEntity = this.extractPropertyValueAsEntity( this.extractProperty( uie, property ) );
        return isDefined( nlpEntity ) && this.isEntityConsideredTrue( nlpEntity );
    }

    isEntityConsideredTrue( nlpEntity: NLPEntity ): boolean {
        return ( Entities.BOOL_VALUE === nlpEntity.entity && 'true' == nlpEntity.value )
            || ( Entities.NUMBER === nlpEntity.entity && Number( nlpEntity.value ) != 0 );
    }


    /**
     * Returns the extract UI Property or null if not found.
     *
     * @param uie UI element
     * @param property Property
     */
    extractProperty( uie: UIElement, property: string ): UIProperty | null {
        if ( ! isDefined( uie.items ) ) {
            return null;
        }
        return uie.items.find( item => property === item.property ) || null;
    }

    /**
     * Returns
     *
     * @param prop UI Property
     */
    extractPropertyValueAsEntity( prop: UIProperty ): NLPEntity | null {
        if ( ! prop ) {
            return null;
        }

        // fallbacks
        const acceptedValueEntities: string[] = [
            Entities.UI_DATA_TYPE, // e.g., string, integer, ...
            Entities.UI_ELEMENT_TYPE, // e.g. button, textbox, ...
            Entities.BOOL_VALUE, // e.g. true, false, ...
            Entities.VALUE,
            Entities.NUMBER,
            Entities.CONSTANT,
            Entities.VALUE_LIST,
            Entities.QUERY
        ];

        for ( let entity of prop.nlpResult.entities ) {
            if ( acceptedValueEntities.indexOf( entity.entity ) >= 0 ) {
                return entity;
            }
        }
        return null;
    }

}