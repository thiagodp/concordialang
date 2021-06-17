import * as enumUtil from 'enum-util';
import { CaseType } from './CaseType';
import { UIElement, UIProperty, UIPropertyTypes } from '../ast';
import { Entities, NLPEntity, NLPUtil } from '../nlp';
import { ActionTargets, EditableActionTargets } from './ActionTargets';
import { convertCase } from './case-conversor';
import { isDefined } from './type-checking';
import { ValueType, ValueTypeDetector } from './ValueTypeDetector';


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
            let entity = item.nlpResult.entities.find( ( e: NLPEntity ) => Entities.VALUE === e.entity );

            if ( ! isDefined( entity ) ) { // Let's try as command
                entity = item.nlpResult.entities.find( ( e: NLPEntity ) => Entities.COMMAND === e.entity );
            }

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
            return ActionTargets.TEXTBOX;
        }
        return nlpEntity.value;
    }

    extractDataType( uie: UIElement ): ValueType | null {
        return this.extractDataTypeFromProperty(
            this.extractProperty( uie, UIPropertyTypes.DATA_TYPE )
            );
    }

    extractDataTypeFromProperty( property: UIProperty ): ValueType | null {
        if ( ! property ) {
            return null;
        }
        const nlpEntity = this.extractPropertyValueAsEntity( property );
        if ( ! isDefined( nlpEntity ) ) {
            return null;
        }
        return this.stringToValueType( nlpEntity.value );
    }

    stringToValueType( value: string ): ValueType | null {
        const dataType: string = value.toString().toLowerCase();
        if ( enumUtil.isValue( ValueType, dataType ) ) {
            return dataType;
        }
        return null;
    }

    guessDataType( map: Map< UIPropertyTypes, UIProperty > ): ValueType {

        // No properties ? -> string
        if ( 0 == map.size ) {
            return ValueType.STRING;
        }

        // Does it have data type ? -> extract it
        if ( map.has( UIPropertyTypes.DATA_TYPE ) ) {
            const entityValue = map.get( UIPropertyTypes.DATA_TYPE ).value;
            return this.stringToValueType( entityValue.value.toString() );
        }

        // Does it have min length or max length -> string
        if ( map.has( UIPropertyTypes.MIN_LENGTH ) ||
            map.has( UIPropertyTypes.MAX_LENGTH )
        ) {
            return ValueType.STRING;
        }

        // Detect properties in sequence and evaluate their type

        const sequence: UIPropertyTypes[] = [
            UIPropertyTypes.MIN_VALUE,
            UIPropertyTypes.MAX_VALUE,
            UIPropertyTypes.VALUE
        ];

        const valueTypeDetector = new ValueTypeDetector();

        for ( const pType of sequence ) {
            if ( map.has( pType ) ) {
                // console.log( 'property of type', pType, '=', map.get( pType ) );
                const entityValue = map.get( pType ).value;
                // console.log( 'entityValue', entityValue );
                return valueTypeDetector.detect( entityValue?.value || '' );
            }
        }

        // Default
        return ValueType.STRING;
    }

    /**
     * Extracts the value of the property `locale`. If not defined, returns `null`.
     *
     * @param uie UI Element
     */
    extractLocale( uie: UIElement ): string | null {
        const nlpEntity = this.extractPropertyValueAsEntity(
            this.extractProperty( uie, UIPropertyTypes.LOCALE )
        );
        if ( ! nlpEntity ) {
            return null;
        }
        return nlpEntity.value.toString();
    }

    /**
     * Extracts the value of the property `locale format`. If not defined, returns `null`.
     *
     * @param uie UI Element
     */
    extractLocaleFormat( uie: UIElement ): string | null {
        const nlpEntity = this.extractPropertyValueAsEntity(
            this.extractProperty( uie, UIPropertyTypes.LOCALE_FORMAT )
        );
        if ( ! nlpEntity ) {
            return null;
        }
        return nlpEntity.value.toString();
    }


    extractIsEditable( uie: UIElement ): boolean {

        // true if no property is found
        if ( ! uie.items || uie.items.length < 1 ) {
            return true;
        }

        // Evaluate property 'editable' if defined
        const nlpEntity = this.extractPropertyValueAsEntity( this.extractProperty( uie, UIPropertyTypes.EDITABLE ) );
        if ( isDefined( nlpEntity ) ) {
            return this.isEntityConsideredTrue( nlpEntity );
        }

        // Evaluate property 'type' (widget) if defined
        const typeNlpEntity = this.extractPropertyValueAsEntity( this.extractProperty( uie, UIPropertyTypes.TYPE ) );
        if ( isDefined( typeNlpEntity ) ) {
            return enumUtil.isValue( EditableActionTargets, typeNlpEntity.value );
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

        return true; // don't change this
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
        const uip: UIProperty = this.extractProperty( uie, property );
        const nlpEntity = this.extractPropertyValueAsEntity( uip );
        if ( uip && ! nlpEntity ) {
            return true;
        }
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
        if ( ! uie || ! uie.items || uie.items.length < 1 ) {
            return null;
        }
        return uie.items.find( item => !! item && property === item.property ) || null;
    }

    extractProperties( uie: UIElement, property: string ): UIProperty[] {
        if ( ! uie || ! uie.items ) {
            return [];
        }
        return uie.items.filter( item => !! item && property === item.property );
    }

    hasEntities( uip: UIProperty, entities: string[] ): boolean {
		if ( ! uip || ! uip.nlpResult || ! uip.nlpResult.entities ) {
			return false;
		}
        const uipEntities: string[] = uip.nlpResult.entities.map( e => e.entity );
        return entities.every( e => uipEntities.indexOf( e ) >= 0 );
    }

    hasEntity( uip: UIProperty, entity: string ): boolean {
		if ( ! uip || ! uip.nlpResult || ! uip.nlpResult.entities ) {
			return false;
		}
        const e = uip.nlpResult.entities.find( nlpEntity => nlpEntity.entity == entity );
        return !!e;
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

        // const acceptedValueEntities: string[] = [
        //     Entities.UI_DATA_TYPE, // e.g., string, integer, ...
        //     Entities.UI_ELEMENT_TYPE, // e.g. button, textbox, ...
        //     Entities.BOOL_VALUE, // e.g. true, false, ...
        //     Entities.VALUE,
        //     Entities.NUMBER,
        //     Entities.CONSTANT,
        //     Entities.VALUE_LIST,
        //     Entities.QUERY
        // ];
        const acceptedValueEntities: string[] = [
            Entities.VALUE,
            Entities.NUMBER,
            Entities.CONSTANT,
            Entities.BOOL_VALUE, // e.g. true, false, ...
            Entities.UI_DATA_TYPE, // e.g., string, integer, ...
            Entities.UI_ELEMENT_TYPE, // e.g. button, textbox, ...
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

    mapPropertiesToPropertyTypes( properties: UIProperty[] ): Map< UIPropertyTypes, UIProperty[] > {
        const map = new Map< UIPropertyTypes, UIProperty[] >();
        for ( const p of properties ) {
            const pType: UIPropertyTypes = p.property as UIPropertyTypes;
            if ( map.has( pType ) ) {
                map.get( pType ).push( p );
            } else {
                map.set( pType, [ p ] );
            }
        }
        return map;
    }

    mapFirstPropertyOfEachType( uie: UIElement ): Map< UIPropertyTypes, UIProperty > {
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
            if ( ! properties || properties.length < 2 ) { // << 2 because 1 has no conflict
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

        // const incompatibleMap = this.incompatiblePropertyTypes();
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
