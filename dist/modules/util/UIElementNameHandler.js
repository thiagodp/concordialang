import { Symbols } from "../req/Symbols";
import { isDefined } from "./type-checking";
/**
 * Handles names of UI Elements.
 *
 * @author Thiago Delgado Pinto
 */
export class UIElementNameHandler {
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
            .replace(Symbols.UI_ELEMENT_PREFIX, '')
            .replace(Symbols.UI_ELEMENT_SUFFIX, '')
            .trim();
        const index = v.indexOf(Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR);
        if (index < 0) { // ui element only
            return [null, v];
        }
        if (1 === v.length) { // separator only, e.g., {:}
            return [null, null];
        }
        return v.split(Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR);
    }
    /**
     * Makes a variable name.
     *
     * @param featureName Feature name
     * @param uiElementName UI Element name
     * @param surroundVariable Whether it should surround the variable with its symbol (brackets).
     */
    makeVariableName(featureName, uiElementName, surroundVariable = false) {
        const variable = (isDefined(featureName) ? featureName + Symbols.FEATURE_TO_UI_ELEMENT_SEPARATOR : '') +
            uiElementName;
        if (!surroundVariable) {
            return variable;
        }
        return Symbols.UI_ELEMENT_PREFIX + variable + Symbols.UI_ELEMENT_SUFFIX;
    }
}
