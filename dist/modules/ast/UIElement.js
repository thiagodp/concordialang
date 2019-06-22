"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Additional information about an UI element.
 *
 * @author Thiago Delgado Pinto
 */
class UIElementInfo {
    /**
     *
     * @param document Document in which the UI element was declared
     * @param uiLiteral Literal
     * @param feature Feature where the UI Element was declared. A `null` value denotes a *global* UI Element.
     */
    constructor(document = null, uiLiteral = null, feature = null, fullVariableName = null) {
        this.document = document;
        this.uiLiteral = uiLiteral;
        this.feature = feature;
        this.fullVariableName = fullVariableName;
    }
    isGlobal() {
        return !this.feature;
    }
}
exports.UIElementInfo = UIElementInfo;
/**
 * Recognized value of an entity.
 *
 * @author Thiago Delgado Pinto
 */
class EntityValue {
    /**
     *
     * @param entity Entity
     * @param value Recognized value, e.g., "SELECT * FROM [MyDB].[Foo]"
     * @param references References nodes, e.g., the database [MyDB] and the table [Foo].
     */
    constructor(entity, value, references = []) {
        this.entity = entity;
        this.value = value;
        this.references = references;
    }
}
exports.EntityValue = EntityValue;
