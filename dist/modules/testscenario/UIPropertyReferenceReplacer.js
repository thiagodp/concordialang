"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const ast_1 = require("../ast");
const util_1 = require("../util");
const RuntimeException_1 = require("../error/RuntimeException");
const Symbols_1 = require("../req/Symbols");
const value_formatter_1 = require("./value-formatter");
/**
 * Replaces UIE property references.
 *
 * @author Thiago Delgado Pinto
 */
class UIPropertyReferenceReplacer {
    /**
     * Returns the content with all the UIProperty references replaced by their value.
     *
     * @param step Input step.
     * @param content Input content.
     * @param uiePropertyReferences References to replace.
     * @param uieVariableToValueMap Map that contains the value of all UIElement variables.
     * @param ctx Generation context.
     * @param insideStringValue Indicates if the value is already inside a string. Optional, defaults to `false`.
     */
    replaceUIPropertyReferencesByTheirValue(step, content, uiePropertyReferences, uieVariableToValueMap, ctx, insideStringValue = false) {
        const uieNameHandler = new util_1.UIElementNameHandler();
        let newContent = content;
        for (let uipRef of uiePropertyReferences || []) {
            // Properties different from VALUE are not supported yet
            if (uipRef.property != ast_1.UIPropertyTypes.VALUE) {
                const fileName = path_1.basename(ctx.doc.fileInfo.path);
                const locStr = '(' + step.location.line + ',' + step.location.column + ')';
                const msg = 'Could not retrieve a value from ' +
                    Symbols_1.Symbols.UI_ELEMENT_PREFIX + uipRef.uiElementName +
                    Symbols_1.Symbols.UI_PROPERTY_REF_SEPARATOR + uipRef.property + Symbols_1.Symbols.UI_ELEMENT_SUFFIX +
                    ' in ' + fileName + ' ' + locStr + '. Not supported yet.';
                ctx.warnings.push(new RuntimeException_1.RuntimeException(msg));
                continue;
            }
            const uieName = uipRef.uiElementName;
            const [featureName, uieNameWithoutFeature] = uieNameHandler.extractNamesOf(uieName);
            let variable;
            let uie;
            if (util_1.isDefined(featureName)) {
                variable = uieName;
                uie = ctx.spec.uiElementByVariable(uieName);
            }
            else {
                uie = ctx.spec.uiElementByVariable(uieName, ctx.doc);
                variable = !uie ? uieName : (!uie.info ? uieName : uie.info.fullVariableName);
            }
            // variable is in the format Feature:UIElement
            let value = uieVariableToValueMap.get(variable);
            if (!util_1.isDefined(value)) {
                const fileName = ctx.doc.fileInfo ? path_1.basename(ctx.doc.fileInfo.path) : 'unknown file';
                const locStr = '(' + step.location.line + ',' + step.location.column + ')';
                const msg = 'Could not retrieve a value from ' +
                    Symbols_1.Symbols.UI_ELEMENT_PREFIX + variable + Symbols_1.Symbols.UI_ELEMENT_SUFFIX +
                    ' in ' + fileName + ' ' + locStr + '. It will receive an empty value.';
                ctx.warnings.push(new RuntimeException_1.RuntimeException(msg));
                value = '';
            }
            const formattedValue = value_formatter_1.formatValueToUseInASentence(value, insideStringValue);
            const refStr = Symbols_1.Symbols.UI_ELEMENT_PREFIX + uipRef.content + Symbols_1.Symbols.UI_ELEMENT_SUFFIX;
            newContent = newContent.replace(refStr, formattedValue);
        }
        return newContent;
    }
}
exports.UIPropertyReferenceReplacer = UIPropertyReferenceReplacer;
