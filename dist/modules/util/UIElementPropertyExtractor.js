"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enumUtil = require("enum-util");
const CaseType_1 = require("./CaseType");
const ast_1 = require("../ast");
const nlp_1 = require("../nlp");
const ActionTargets_1 = require("./ActionTargets");
const CaseConversor_1 = require("./CaseConversor");
const TypeChecking_1 = require("./TypeChecking");
const ValueTypeDetector_1 = require("./ValueTypeDetector");
/**
 * Extract properties from UI Elements.
 *
 * @author Thiago Delgado Pinto
 */
class UIElementPropertyExtractor {
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
    extractId(uie, caseOption = CaseType_1.CaseType.CAMEL) {
        // Find a property "id" in the UI element
        const item = this.extractProperty(uie, ast_1.UIPropertyTypes.ID);
        if (TypeChecking_1.isDefined(item)) {
            // Find an entity "value" in the NLP result
            let entity = item.nlpResult.entities.find((e) => nlp_1.Entities.VALUE === e.entity);
            if (!TypeChecking_1.isDefined(entity)) { // Let's try as command
                entity = item.nlpResult.entities.find((e) => nlp_1.Entities.COMMAND === e.entity);
            }
            if (TypeChecking_1.isDefined(entity)) {
                return entity.value;
            }
        }
        // Use the UI_ELEMENT name as the id
        return CaseConversor_1.convertCase(uie.name, caseOption);
    }
    extractType(uie) {
        const nlpEntity = this.extractPropertyValueAsEntity(this.extractProperty(uie, ast_1.UIPropertyTypes.TYPE));
        if (!TypeChecking_1.isDefined(nlpEntity)) {
            return ActionTargets_1.ActionTargets.TEXTBOX;
        }
        return nlpEntity.value;
    }
    extractDataType(uie) {
        return this.extractDataTypeFromProperty(this.extractProperty(uie, ast_1.UIPropertyTypes.DATA_TYPE));
    }
    extractDataTypeFromProperty(property) {
        if (!property) {
            return null;
        }
        const nlpEntity = this.extractPropertyValueAsEntity(property);
        if (!TypeChecking_1.isDefined(nlpEntity)) {
            return null;
        }
        return this.stringToValueType(nlpEntity.value);
    }
    stringToValueType(value) {
        const dataType = value.toString().toLowerCase();
        if (enumUtil.isValue(ValueTypeDetector_1.ValueType, dataType)) {
            return dataType;
        }
        return null;
    }
    guessDataType(map) {
        // No properties ? -> string
        if (0 == map.size) {
            return ValueTypeDetector_1.ValueType.STRING;
        }
        // Does it have data type ? -> extract it
        if (map.has(ast_1.UIPropertyTypes.DATA_TYPE)) {
            const entityValue = map.get(ast_1.UIPropertyTypes.DATA_TYPE).value;
            return this.stringToValueType(entityValue.value.toString());
        }
        // Does it have min length or max length -> string
        if (map.has(ast_1.UIPropertyTypes.MIN_LENGTH) ||
            map.has(ast_1.UIPropertyTypes.MAX_LENGTH)) {
            return ValueTypeDetector_1.ValueType.STRING;
        }
        // Detect properties in sequence and evaluate their type
        const sequence = [
            ast_1.UIPropertyTypes.MIN_VALUE,
            ast_1.UIPropertyTypes.MAX_VALUE,
            ast_1.UIPropertyTypes.VALUE
        ];
        const valueTypeDetector = new ValueTypeDetector_1.ValueTypeDetector();
        for (const pType of sequence) {
            if (map.has(pType)) {
                const entityValue = map.get(pType).value;
                return valueTypeDetector.detect(entityValue.value);
            }
        }
        // Default
        return ValueTypeDetector_1.ValueType.STRING;
    }
    extractIsEditable(uie) {
        // true if no property is found
        if (!uie.items || uie.items.length < 1) {
            return true;
        }
        // Evaluate property 'editable' if defined
        const nlpEntity = this.extractPropertyValueAsEntity(this.extractProperty(uie, ast_1.UIPropertyTypes.EDITABLE));
        if (TypeChecking_1.isDefined(nlpEntity)) {
            return this.isEntityConsideredTrue(nlpEntity);
        }
        // Evaluate property 'type' (widget) if defined
        const typeNlpEntity = this.extractPropertyValueAsEntity(this.extractProperty(uie, ast_1.UIPropertyTypes.TYPE));
        if (TypeChecking_1.isDefined(typeNlpEntity)) {
            return enumUtil.isValue(ActionTargets_1.EditableActionTargets, typeNlpEntity.value);
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
        return this.isPropertyConsideredTrue(uie, ast_1.UIPropertyTypes.REQUIRED);
    }
    isPropertyDefined(uie, prop) {
        return TypeChecking_1.isDefined(this.extractProperty(uie, prop));
    }
    isPropertyConsideredTrue(uie, property) {
        const uip = this.extractProperty(uie, property);
        const nlpEntity = this.extractPropertyValueAsEntity(uip);
        if (uip && !nlpEntity) {
            return true;
        }
        return TypeChecking_1.isDefined(nlpEntity) && this.isEntityConsideredTrue(nlpEntity);
    }
    isEntityConsideredTrue(nlpEntity) {
        return (nlp_1.Entities.BOOL_VALUE === nlpEntity.entity && 'true' == nlpEntity.value)
            || (nlp_1.Entities.NUMBER === nlpEntity.entity && Number(nlpEntity.value) != 0);
    }
    /**
     * Returns the extract UI Property or null if not found.
     *
     * @param uie UI element
     * @param property Property
     */
    extractProperty(uie, property) {
        if (!TypeChecking_1.isDefined(uie.items)) {
            return null;
        }
        return uie.items.find(item => !!item && property === item.property) || null;
    }
    extractProperties(uie, property) {
        if (!TypeChecking_1.isDefined(uie.items)) {
            return [];
        }
        return uie.items.filter(item => !!item && property === item.property);
    }
    hasEntities(uip, entities) {
        const uipEntities = uip.nlpResult.entities.map(e => e.entity);
        return entities.every(e => uipEntities.indexOf(e) >= 0);
    }
    hasEntity(uip, entity) {
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
        const acceptedValueEntities = [
            nlp_1.Entities.UI_DATA_TYPE,
            nlp_1.Entities.UI_ELEMENT_TYPE,
            nlp_1.Entities.BOOL_VALUE,
            nlp_1.Entities.VALUE,
            nlp_1.Entities.NUMBER,
            nlp_1.Entities.CONSTANT,
            nlp_1.Entities.VALUE_LIST,
            nlp_1.Entities.QUERY
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
        const allPropertyTypes = enumUtil.getValues(ast_1.UIPropertyTypes);
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
        const allPropertyTypes = enumUtil.getValues(ast_1.UIPropertyTypes);
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
            ast_1.UIPropertyTypes.ID,
            ast_1.UIPropertyTypes.TYPE,
            ast_1.UIPropertyTypes.EDITABLE,
            ast_1.UIPropertyTypes.DATA_TYPE,
            ast_1.UIPropertyTypes.FORMAT,
            ast_1.UIPropertyTypes.REQUIRED
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
            ast_1.UIPropertyTypes.VALUE,
            ast_1.UIPropertyTypes.MIN_LENGTH,
            ast_1.UIPropertyTypes.MAX_LENGTH,
            ast_1.UIPropertyTypes.MIN_VALUE,
            ast_1.UIPropertyTypes.MAX_VALUE
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
            ast_1.UIPropertyTypes.VALUE,
            ast_1.UIPropertyTypes.MIN_LENGTH,
            ast_1.UIPropertyTypes.MAX_LENGTH,
            ast_1.UIPropertyTypes.MIN_VALUE,
            ast_1.UIPropertyTypes.MAX_VALUE,
            ast_1.UIPropertyTypes.FORMAT
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
        const nlpUtil = new nlp_1.NLPUtil();
        for (let propType of valueBasedPropertyTypes) {
            let properties = propertiesMap.get(propType);
            if (!properties || properties.length < 2) { // << 2 because 1 has no conflict
                continue;
            }
            // Operators are not compatible, so if there are more than one operator
            // in the properties, there is a problem.
            const operatorSet = new Set(properties
                .map(p => nlpUtil.entityNamed(nlp_1.Entities.UI_CONNECTOR, p.nlpResult))
                .map(entity => entity.entity));
            if (operatorSet.size > 1) {
                incompatible.push(properties);
                continue;
            }
            // Same operator without modifier -> problem
            const modifiers = properties
                .map(p => nlpUtil.entityNamed(nlp_1.Entities.UI_CONNECTOR_MODIFIER, p.nlpResult))
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
        map.set(ast_1.UIPropertyTypes.VALUE, [
            ast_1.UIPropertyTypes.MIN_VALUE,
            ast_1.UIPropertyTypes.MAX_VALUE,
            ast_1.UIPropertyTypes.MIN_LENGTH,
            ast_1.UIPropertyTypes.MAX_LENGTH,
            ast_1.UIPropertyTypes.FORMAT
        ]);
        map.set(ast_1.UIPropertyTypes.MIN_VALUE, [
            ast_1.UIPropertyTypes.VALUE,
            ast_1.UIPropertyTypes.MIN_LENGTH,
            ast_1.UIPropertyTypes.MAX_LENGTH
        ]);
        map.set(ast_1.UIPropertyTypes.MAX_VALUE, [
            ast_1.UIPropertyTypes.VALUE,
            ast_1.UIPropertyTypes.MIN_LENGTH,
            ast_1.UIPropertyTypes.MAX_LENGTH
        ]);
        map.set(ast_1.UIPropertyTypes.MIN_LENGTH, [
            ast_1.UIPropertyTypes.VALUE,
            ast_1.UIPropertyTypes.MIN_VALUE,
            ast_1.UIPropertyTypes.MAX_VALUE
        ]);
        map.set(ast_1.UIPropertyTypes.MAX_LENGTH, [
            ast_1.UIPropertyTypes.VALUE,
            ast_1.UIPropertyTypes.MIN_VALUE,
            ast_1.UIPropertyTypes.MAX_VALUE
        ]);
        map.set(ast_1.UIPropertyTypes.FORMAT, [
            ast_1.UIPropertyTypes.VALUE
        ]);
        return map;
    }
}
exports.UIElementPropertyExtractor = UIElementPropertyExtractor;
