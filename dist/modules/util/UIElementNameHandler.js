"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Symbols_1 = require("../req/Symbols");
const TypeChecking_1 = require("./TypeChecking");
/**
 * Handles names of UI Elements.
 *
 * @author Thiago Delgado Pinto
 */
class UIElementNameHandler {
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
    extractFeatureNameOf(variable) {
        return this.extractNamesOf(variable)[0];
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
    extractVariableNameOf(variable) {
        return this.extractNamesOf(variable)[1];
    }
    /**
     * Retrieves the feature name and the ui element name of a variable, if available.
     * Always returns an array with at least two elements. The first element is always
     * the feature name or null if not found. The second element is always the ui element
     * name or null if not found.
     *
     * Accepted formats:
     * - feature:variable
     * - variable
     * - {feature:variable}
     * - {variable}
     *
     * @param variable Variable to check.
     */
    extractNamesOf(variable) {
        const v = variable
            .replace(Symbols_1.Symbols.UI_ELEMENT_PREFIX, '')
            .replace(Symbols_1.Symbols.UI_ELEMENT_SUFFIX, '')
            .trim();
        const index = v.indexOf(Symbols_1.Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR);
        if (index < 0) { // ui element only
            return [null, v];
        }
        if (1 === v.length) { // separator only, e.g., {:}
            return [null, null];
        }
        return v.split(Symbols_1.Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR);
    }
    /**
     * Makes a variable name.
     *
     * @param featureName Feature name
     * @param uiElementName UI Element name
     * @param surroundVariable Whether it should surround the variable with its symbol (brackets).
     */
    makeVariableName(featureName, uiElementName, surroundVariable = false) {
        const variable = (TypeChecking_1.isDefined(featureName) ? featureName + Symbols_1.Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR : '') +
            uiElementName;
        if (!surroundVariable) {
            return variable;
        }
        return Symbols_1.Symbols.UI_ELEMENT_PREFIX + variable + Symbols_1.Symbols.UI_ELEMENT_SUFFIX;
    }
}
exports.UIElementNameHandler = UIElementNameHandler;
