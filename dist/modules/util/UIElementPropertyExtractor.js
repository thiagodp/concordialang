import * as enumUtil from 'enum-util';
import { CaseType } from './CaseType';
import { UIPropertyTypes } from '../ast';
import { Entities, NLPUtil } from '../nlp';
import { ActionTargets, EditableActionTargets } from './ActionTargets';
import { convertCase } from './CaseConversor';
import { isDefined } from './TypeChecking';
import { ValueType, ValueTypeDetector } from './ValueTypeDetector';
/**
 * Extract properties from UI Elements.
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementPropertyExtractor {
    constructor() {
        this._incompatiblePropertiesMap = new Map();
    }
    /**
     * Extract the `id` property from a UI Element. If the property does not exist,
     * generates an id from the element name.
     *
     * @param uie UI Element
     * @param caseOption Case option
     */
    extractId(uie, caseOption = CaseType.CAMEL) {
        // Find a property "id" in the UI element
        const item = this.extractProperty(uie, UIPropertyTypes.ID);
        if (isDefined(item)) {
            // Find an entity "value" in the NLP result
            let entity = item.nlpResult.entities.find((e) => Entities.VALUE === e.entity);
            if (!isDefined(entity)) { // Let's try as command
                entity = item.nlpResult.entities.find((e) => Entities.COMMAND === e.entity);
            }
            if (isDefined(entity)) {
                return entity.value;
            }
        }
        // Use the UI_ELEMENT name as the id
        return convertCase(uie.name, caseOption);
    }
    extractType(uie) {
        const nlpEntity = this.extractPropertyValueAsEntity(this.extractProperty(uie, UIPropertyTypes.TYPE));
        if (!isDefined(nlpEntity)) {
            return ActionTargets.TEXTBOX;
        }
        return nlpEntity.value;
    }
    extractDataType(uie) {
        return this.extractDataTypeFromProperty(this.extractProperty(uie, UIPropertyTypes.DATA_TYPE));
    }
    extractDataTypeFromProperty(property) {
        if (!property) {
            return null;
        }
        const nlpEntity = this.extractPropertyValueAsEntity(property);
        if (!isDefined(nlpEntity)) {
            return null;
        }
        return this.stringToValueType(nlpEntity.value);
    }
    stringToValueType(value) {
        const dataType = value.toString().toLowerCase();
        if (enumUtil.isValue(ValueType, dataType)) {
            return dataType;
        }
        return null;
    }
    guessDataType(map) {
        // No properties ? -> string
        if (0 == map.size) {
            return ValueType.STRING;
        }
        // Does it have data type ? -> extract it
        if (map.has(UIPropertyTypes.DATA_TYPE)) {
            const entityValue = map.get(UIPropertyTypes.DATA_TYPE).value;
            return this.stringToValueType(entityValue.value.toString());
        }
        // Does it have min length or max length -> string
        if (map.has(UIPropertyTypes.MIN_LENGTH) ||
            map.has(UIPropertyTypes.MAX_LENGTH)) {
            return ValueType.STRING;
        }
        // Detect properties in sequence and evaluate their type
        const sequence = [
            UIPropertyTypes.MIN_VALUE,
            UIPropertyTypes.MAX_VALUE,
            UIPropertyTypes.VALUE
        ];
        const valueTypeDetector = new ValueTypeDetector();
        for (const pType of sequence) {
            if (map.has(pType)) {
                // console.log( 'property of type', pType, '=', map.get( pType ) );
                const entityValue = map.get(pType).value;
                // console.log( 'entityValue', entityValue );
                return valueTypeDetector.detect(entityValue?.value || '');
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
    extractLocale(uie) {
        const nlpEntity = this.extractPropertyValueAsEntity(this.extractProperty(uie, UIPropertyTypes.LOCALE));
        if (!nlpEntity) {
            return null;
        }
        return nlpEntity.value.toString();
    }
    /**
     * Extracts the value of the property `locale format`. If not defined, returns `null`.
     *
     * @param uie UI Element
     */
    extractLocaleFormat(uie) {
        const nlpEntity = this.extractPropertyValueAsEntity(this.extractProperty(uie, UIPropertyTypes.LOCALE_FORMAT));
        if (!nlpEntity) {
            return null;
        }
        return nlpEntity.value.toString();
    }
    extractIsEditable(uie) {
        // true if no property is found
        if (!uie.items || uie.items.length < 1) {
            return true;
        }
        // Evaluate property 'editable' if defined
        const nlpEntity = this.extractPropertyValueAsEntity(this.extractProperty(uie, UIPropertyTypes.EDITABLE));
        if (isDefined(nlpEntity)) {
            return this.isEntityConsideredTrue(nlpEntity);
        }
        // Evaluate property 'type' (widget) if defined
        const typeNlpEntity = this.extractPropertyValueAsEntity(this.extractProperty(uie, UIPropertyTypes.TYPE));
        if (isDefined(typeNlpEntity)) {
            return enumUtil.isValue(EditableActionTargets, typeNlpEntity.value);
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
    extractIsRequired(uie) {
        return this.isPropertyConsideredTrue(uie, UIPropertyTypes.REQUIRED);
    }
    isPropertyDefined(uie, prop) {
        return isDefined(this.extractProperty(uie, prop));
    }
    isPropertyConsideredTrue(uie, property) {
        const uip = this.extractProperty(uie, property);
        const nlpEntity = this.extractPropertyValueAsEntity(uip);
        if (uip && !nlpEntity) {
            return true;
        }
        return isDefined(nlpEntity) && this.isEntityConsideredTrue(nlpEntity);
    }
    isEntityConsideredTrue(nlpEntity) {
        return (Entities.BOOL_VALUE === nlpEntity.entity && 'true' == nlpEntity.value)
            || (Entities.NUMBER === nlpEntity.entity && Number(nlpEntity.value) != 0);
    }
    /**
     * Returns the extract UI Property or null if not found.
     *
     * @param uie UI element
     * @param property Property
     */
    extractProperty(uie, property) {
        if (!uie || !uie.items || uie.items.length < 1) {
            return null;
        }
        return uie.items.find(item => !!item && property === item.property) || null;
    }
    extractProperties(uie, property) {
        if (!uie || !uie.items) {
            return [];
        }
        return uie.items.filter(item => !!item && property === item.property);
    }
    hasEntities(uip, entities) {
        if (!uip || !uip.nlpResult || !uip.nlpResult.entities) {
            return false;
        }
        const uipEntities = uip.nlpResult.entities.map(e => e.entity);
        return entities.every(e => uipEntities.indexOf(e) >= 0);
    }
    hasEntity(uip, entity) {
        if (!uip || !uip.nlpResult || !uip.nlpResult.entities) {
            return false;
        }
        const e = uip.nlpResult.entities.find(nlpEntity => nlpEntity.entity == entity);
        return !!e;
    }
    /**
     * Returns
     *
     * @param prop UI Property
     */
    extractPropertyValueAsEntity(prop) {
        if (!prop) {
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
        const acceptedValueEntities = [
            Entities.VALUE,
            Entities.NUMBER,
            Entities.CONSTANT,
            Entities.BOOL_VALUE,
            Entities.UI_DATA_TYPE,
            Entities.UI_ELEMENT_TYPE,
            Entities.VALUE_LIST,
            Entities.QUERY
        ];
        for (let entity of prop.nlpResult.entities) {
            if (acceptedValueEntities.indexOf(entity.entity) >= 0) {
                return entity;
            }
        }
        return null;
    }
    mapProperties(uie) {
        let map = new Map();
        const allPropertyTypes = enumUtil.getValues(UIPropertyTypes);
        for (let propType of allPropertyTypes) {
            let properties = this.extractProperties(uie, propType);
            if (properties !== null) {
                map.set(propType, properties);
            }
        }
        return map;
    }
    mapPropertiesToPropertyTypes(properties) {
        const map = new Map();
        for (const p of properties) {
            const pType = p.property;
            if (map.has(pType)) {
                map.get(pType).push(p);
            }
            else {
                map.set(pType, [p]);
            }
        }
        return map;
    }
    mapFirstPropertyOfEachType(uie) {
        let map = new Map();
        const allPropertyTypes = enumUtil.getValues(UIPropertyTypes);
        for (let propType of allPropertyTypes) {
            let property = this.extractProperty(uie, propType);
            if (property !== null) {
                map.set(propType, property);
            }
        }
        return map;
    }
    /**
     * Return non-repeatable properties that are repeated.
     *
     * @param propertiesMap
     */
    nonRepeatableProperties(propertiesMap) {
        let nonRepeatable = [];
        const nonRepeatablePropertyTypes = [
            UIPropertyTypes.ID,
            UIPropertyTypes.TYPE,
            UIPropertyTypes.EDITABLE,
            UIPropertyTypes.DATA_TYPE,
            UIPropertyTypes.FORMAT,
            UIPropertyTypes.REQUIRED
        ];
        for (let propType of nonRepeatablePropertyTypes) {
            let properties = propertiesMap.get(propType) || [];
            if (properties.length >= 2) {
                nonRepeatable.push(properties);
            }
        }
        return nonRepeatable;
    }
    /**
     * Returns non-triplicatable properties that are triplicated.
     *
     * @param propertiesMap
     */
    nonTriplicatableProperties(propertiesMap) {
        let nonTriplicatable = [];
        const nonTriplicatablePropertyTypes = [
            UIPropertyTypes.VALUE,
            UIPropertyTypes.MIN_LENGTH,
            UIPropertyTypes.MAX_LENGTH,
            UIPropertyTypes.MIN_VALUE,
            UIPropertyTypes.MAX_VALUE
        ];
        for (let propType of nonTriplicatablePropertyTypes) {
            let properties = propertiesMap.get(propType) || [];
            if (properties.length >= 3) {
                nonTriplicatable.push(properties);
            }
        }
        return nonTriplicatable;
    }
    valueBasedPropertyTypes() {
        return [
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
    incompatibleProperties(propertiesMap) {
        const valueBasedPropertyTypes = this.valueBasedPropertyTypes();
        // All value-related properties
        let declaredPropertyTypes = [];
        let declaredPropertyMap = new Map(); // Just the first of each kind
        for (let propType of valueBasedPropertyTypes) {
            let properties = propertiesMap.get(propType);
            if (!properties || properties.length < 2) { // << 2 because 1 has no conflict
                continue;
            }
            let uiProperty = properties[0];
            declaredPropertyTypes.push(propType);
            declaredPropertyMap.set(propType, uiProperty);
        }
        const declaredCount = declaredPropertyTypes.length;
        if (declaredCount <= 1) {
            return [];
        }
        // const incompatibleMap = this.incompatiblePropertyTypes();
        let incompatible = [];
        for (let i = 0; i < declaredCount; ++i) {
            let a = declaredPropertyTypes[i];
            for (let j = i + 1; j < declaredCount; ++j) {
                let b = declaredPropertyTypes[j];
                if (!this.areIncompatible(a, b)) {
                    // Add incompatible UI Properties
                    incompatible.push([
                        declaredPropertyMap.get(a),
                        declaredPropertyMap.get(b)
                    ]);
                }
            }
        }
        return incompatible;
    }
    incompatibleOperators(propertiesMap) {
        let incompatible = [];
        const valueBasedPropertyTypes = this.valueBasedPropertyTypes();
        const nlpUtil = new NLPUtil();
        for (let propType of valueBasedPropertyTypes) {
            let properties = propertiesMap.get(propType);
            if (!properties || properties.length < 2) { // << 2 because 1 has no conflict
                continue;
            }
            // Operators are not compatible, so if there are more than one operator
            // in the properties, there is a problem.
            const operatorSet = new Set(properties
                .map(p => nlpUtil.entityNamed(Entities.UI_CONNECTOR, p.nlpResult))
                .map(entity => entity.entity));
            if (operatorSet.size > 1) {
                incompatible.push(properties);
                continue;
            }
            // Same operator without modifier -> problem
            const modifiers = properties
                .map(p => nlpUtil.entityNamed(Entities.UI_CONNECTOR_MODIFIER, p.nlpResult))
                .map(entity => entity.entity);
            if (modifiers.length != 1) { // e.g., 0 or 2
                incompatible.push(properties);
            }
        }
        return incompatible;
    }
    areIncompatible(a, b) {
        return (this.incompatiblePropertyTypes().get(a) || []).indexOf(b) >= 0;
    }
    incompatiblePropertyTypes() {
        if (this._incompatiblePropertiesMap.size > 0) {
            return this._incompatiblePropertiesMap;
        }
        // Fill
        let map = this._incompatiblePropertiesMap;
        map.set(UIPropertyTypes.VALUE, [
            UIPropertyTypes.MIN_VALUE,
            UIPropertyTypes.MAX_VALUE,
            UIPropertyTypes.MIN_LENGTH,
            UIPropertyTypes.MAX_LENGTH,
            UIPropertyTypes.FORMAT
        ]);
        map.set(UIPropertyTypes.MIN_VALUE, [
            UIPropertyTypes.VALUE,
            UIPropertyTypes.MIN_LENGTH,
            UIPropertyTypes.MAX_LENGTH
        ]);
        map.set(UIPropertyTypes.MAX_VALUE, [
            UIPropertyTypes.VALUE,
            UIPropertyTypes.MIN_LENGTH,
            UIPropertyTypes.MAX_LENGTH
        ]);
        map.set(UIPropertyTypes.MIN_LENGTH, [
            UIPropertyTypes.VALUE,
            UIPropertyTypes.MIN_VALUE,
            UIPropertyTypes.MAX_VALUE
        ]);
        map.set(UIPropertyTypes.MAX_LENGTH, [
            UIPropertyTypes.VALUE,
            UIPropertyTypes.MIN_VALUE,
            UIPropertyTypes.MAX_VALUE
        ]);
        map.set(UIPropertyTypes.FORMAT, [
            UIPropertyTypes.VALUE
        ]);
        return map;
    }
}
