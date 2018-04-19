import { UIElement, UIProperty } from "../ast/UIElement";
import { CaseType } from "../app/CaseType";
import { isDefined } from "./TypeChecking";
import { Entities } from "../nlp/Entities";
import { NLPEntity, NLPUtil } from "../nlp/NLPResult";
import { convertCase } from "./CaseConversor";
import { UIPropertyTypes } from "./UIPropertyTypes";
import { ALL_VALUE_TYPES, ValueType } from "./ValueTypeDetector";
import { Spec } from "../ast/Spec";
import { LocatedException } from "../req/LocatedException";
import { EditableUIElementTypes } from "./UIElementTypes";
import * as enumUtil from 'enum-util';

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
        const defaultDataType = ValueType.STRING.toString();

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

        // true if no property is found
        if ( ! uie.items || uie.items.length < 1 ) {
            return true;
        }
        // console.log( uie.items.length, 'items', uie.items[ 0 ].content );

        // Evaluate property 'editable' if defined
        const nlpEntity = this.extractPropertyValueAsEntity( this.extractProperty( uie, UIPropertyTypes.EDITABLE ) );
        if ( isDefined( nlpEntity ) ) {
            return this.isEntityConsideredTrue( nlpEntity );
        }

        // Evaluate property 'type' (widget) if defined
        const typeNlpEntity = this.extractPropertyValueAsEntity( this.extractProperty( uie, UIPropertyTypes.TYPE ) );
        if ( isDefined( typeNlpEntity ) ) {
            return enumUtil.isValue( EditableUIElementTypes, typeNlpEntity.value );
        }

        // // Or does not have the property 'editable' but have one of the following properties defined:
        // const consideredAsEditable: string[] = [
        //     UIPropertyTypes.DATA_TYPE,
        //     UIPropertyTypes.MIN_LENGTH,
        //     UIPropertyTypes.MAX_LENGTH,
        //     UIPropertyTypes.MIN_VALUE,
        //     UIPropertyTypes.MAX_VALUE
        // ];

        // for ( let property of consideredAsEditable ) {
        //     if ( isDefined( this.extractProperty( uie, property ) ) ) {
        //         return true;
        //     }
        // }

        // return false;

        // Otherwise is true
        return true;
    }

    extractIsRequired( uie: UIElement ): boolean {
        return this.isPropertyConsideredTrue( uie, UIPropertyTypes.REQUIRED );
    }



    isPropertyDefined( uie: UIElement, prop: string | UIPropertyTypes  ): boolean {
        return isDefined( this.extractProperty(
            uie,
            prop
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

    extractProperties( uie: UIElement, property: string ): UIProperty[] {
        if ( ! isDefined( uie.items ) ) {
            return [];
        }
        return uie.items.filter( item => property === item.property );
    }

    hasEntities( uip: UIProperty, entities: string[] ): boolean {
        const uipEntities: string[] = uip.nlpResult.entities.map( e => e.entity );
        return entities.every( e => uipEntities.indexOf( e ) >= 0 );
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

    mapProperties( uie: UIElement ): Map< UIPropertyTypes, UIProperty[] > {
        let map = new Map< UIPropertyTypes, UIProperty[] >();
        const allPropertyTypes = enumUtil.getValues( UIPropertyTypes );
        for ( let propType of allPropertyTypes ) {
            let properties = this.extractProperties( uie, propType );
            if ( properties !== null ) {
                map.set( propType, properties );
            }
        }
        return map;
    }

    mapFirstProperty( uie: UIElement ): Map< UIPropertyTypes, UIProperty > {
        let map = new Map< UIPropertyTypes, UIProperty >();
        const allPropertyTypes = enumUtil.getValues( UIPropertyTypes );
        for ( let propType of allPropertyTypes ) {
            let property = this.extractProperty( uie, propType );
            if ( property !== null ) {
                map.set( propType, property );
            }
        }
        return map;
    }

    /**
     * Return non-repeatable properties that are repeated.
     *
     * @param propertiesMap
     */
    nonRepeatableProperties( propertiesMap: Map< UIPropertyTypes, UIProperty[] > ): UIProperty[][] {
        let nonRepeatable: UIProperty[][] = [];

        const nonRepeatablePropertyTypes: UIPropertyTypes[] = [
            UIPropertyTypes.ID,
            UIPropertyTypes.TYPE,
            UIPropertyTypes.EDITABLE,
            UIPropertyTypes.DATA_TYPE,
            UIPropertyTypes.FORMAT,
            UIPropertyTypes.REQUIRED
        ];

        for ( let propType of nonRepeatablePropertyTypes ) {
            let properties = propertiesMap.get( propType ) || [];
            if ( properties.length >= 2 ) {
                nonRepeatable.push( properties );
            }
        }
        return nonRepeatable;
    }

    /**
     * Returns non-triplicatable properties that are triplicated.
     *
     * @param propertiesMap
     */
    nonTriplicatableProperties( propertiesMap: Map< UIPropertyTypes, UIProperty[] > ): UIProperty[][] {
        let nonTriplicatable: UIProperty[][] = [];

        const nonTriplicatablePropertyTypes: UIPropertyTypes[] = [
            UIPropertyTypes.VALUE,
            UIPropertyTypes.MIN_LENGTH,
            UIPropertyTypes.MAX_LENGTH,
            UIPropertyTypes.MIN_VALUE,
            UIPropertyTypes.MAX_VALUE
        ];

        for ( let propType of nonTriplicatablePropertyTypes ) {
            let properties = propertiesMap.get( propType ) || [];
            if ( properties.length >= 3 ) {
                nonTriplicatable.push( properties );
            }
        }
        return nonTriplicatable;
    }


    valueBasedPropertyTypes(): UIPropertyTypes[] {
        return  [
            UIPropertyTypes.VALUE,
            UIPropertyTypes.MIN_LENGTH,
            UIPropertyTypes.MAX_LENGTH,
            UIPropertyTypes.MIN_VALUE,
            UIPropertyTypes.MAX_VALUE,
            UIPropertyTypes.FORMAT
        ];
    }

    /**
     * Returns incompatible properties found.
     *
     * @param propertiesMap
     */
    incompatibleProperties( propertiesMap: Map< UIPropertyTypes, UIProperty[] > ): UIProperty[][] {

        const valueBasedPropertyTypes = this.valueBasedPropertyTypes();

        // All value-related properties
        let declaredPropertyTypes: UIPropertyTypes[] = [];
        let declaredPropertyMap = new Map< UIPropertyTypes, UIProperty >(); // Just the first of each kind
        for ( let propType of valueBasedPropertyTypes ) {

            let properties = propertiesMap.get( propType );
            if ( ! properties || properties.length < 2 ) { // << 2 because 1 has no conflit
                continue;
            }
            let uiProperty = properties[ 0 ];
            declaredPropertyTypes.push( propType );
            declaredPropertyMap.set( propType, uiProperty );
        }

        const declaredCount = declaredPropertyTypes.length;
        if ( declaredCount <= 1 ) {
            return [];
        }

        const incompatibleMap = this.incompatiblePropertyTypes();
        let incompatible: UIProperty[][] = [];

        for ( let i = 0; i < declaredCount; ++i ) {
            let a = declaredPropertyTypes[ i ];
            for ( let j = i + 1; j < declaredCount; ++j ) {
                let b = declaredPropertyTypes[ j ];
                if ( ! this.areIncompatible( a, b ) ) {
                    // Add incompatible UI Properties
                    incompatible.push( [
                        declaredPropertyMap.get( a ),
                        declaredPropertyMap.get( b )
                    ] );
                }
            }
        }

        return incompatible;
    }


    incompatibleOperators( propertiesMap: Map< UIPropertyTypes, UIProperty[] > ): UIProperty[][] {
        let incompatible: UIProperty[][] = [];
        const valueBasedPropertyTypes = this.valueBasedPropertyTypes();
        const nlpUtil = new NLPUtil();

        for ( let propType of valueBasedPropertyTypes ) {
            let properties = propertiesMap.get( propType );
            if ( ! properties || properties.length < 2 ) { // << 2 because 1 has no conflict
                continue;
            }
            // Operators are not compatible, so if there are more than one operator
            // in the properties, there is a problem.
            const operatorSet = new Set( properties
                .map( p => nlpUtil.entityNamed( Entities.UI_CONNECTOR, p.nlpResult ) )
                .map( entity => entity.entity )
            );
            if ( operatorSet.size > 1 ) {
                incompatible.push( properties );
                continue;
            }
            // Same operator without modifier -> problem
            const modifiers = properties
                .map( p => nlpUtil.entityNamed( Entities.UI_CONNECTOR_MODIFIER, p.nlpResult ) )
                .map( entity => entity.entity );
            if ( modifiers.length != 1 ) { // e.g., 0 or 2
                incompatible.push( properties );
            }
        }

        return incompatible;
    }



    areIncompatible( a: UIPropertyTypes, b: UIPropertyTypes ): boolean {
        return ( this.incompatiblePropertyTypes().get( a ) || [] ).indexOf( b ) >= 0;
    }

    incompatiblePropertyTypes(): Map< UIPropertyTypes, UIPropertyTypes[] > {

        if ( this._incompatiblePropertiesMap.size > 0 ) {
            return this._incompatiblePropertiesMap;
        }

        // Fill
        let map = this._incompatiblePropertiesMap;

        map.set(
            UIPropertyTypes.VALUE,
            [
                UIPropertyTypes.MIN_VALUE,
                UIPropertyTypes.MAX_VALUE,
                UIPropertyTypes.MIN_LENGTH,
                UIPropertyTypes.MAX_LENGTH,
                UIPropertyTypes.FORMAT
            ]
        );

        map.set(
            UIPropertyTypes.MIN_VALUE,
            [
                UIPropertyTypes.VALUE,
                UIPropertyTypes.MIN_LENGTH,
                UIPropertyTypes.MAX_LENGTH
            ]
        );

        map.set(
            UIPropertyTypes.MAX_VALUE,
            [
                UIPropertyTypes.VALUE,
                UIPropertyTypes.MIN_LENGTH,
                UIPropertyTypes.MAX_LENGTH
            ]
        );


        map.set(
            UIPropertyTypes.MIN_LENGTH,
            [
                UIPropertyTypes.VALUE,
                UIPropertyTypes.MIN_VALUE,
                UIPropertyTypes.MAX_VALUE
            ]
        );

        map.set(
            UIPropertyTypes.MAX_LENGTH,
            [
                UIPropertyTypes.VALUE,
                UIPropertyTypes.MIN_VALUE,
                UIPropertyTypes.MAX_VALUE
            ]
        );

        map.set(
            UIPropertyTypes.FORMAT,
            [
                UIPropertyTypes.VALUE
            ]
        );

        return map;
    }

    private _incompatiblePropertiesMap = new Map< UIPropertyTypes, UIPropertyTypes[] >();

}