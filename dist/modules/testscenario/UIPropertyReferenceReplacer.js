"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const ast_1 = require("../ast");
const util_1 = require("../util");
const RuntimeException_1 = require("../error/RuntimeException");
const Symbols_1 = require("../req/Symbols");
const value_formater_1 = require("./value-formater");
class UIPropertyReferenceReplacer {
    /**
     * Returns the step content with all the UIProperty references replaced by their value.
     *
     * @param step Input step.
     * @param uiePropertyReferences References to replace.
     * @param uieVariableToValueMap Map that contains the value of all UIElement variables.
     * @param ctx Generation context.
     */
    replaceUIPropertyReferencesByTheirValue(step, uiePropertyReferences, uieVariableToValueMap, ctx) {
        const uieNameHandler = new util_1.UIElementNameHandler();
        let content = step.content;
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
            const formattedValue = value_formater_1.formatValueToUseInASentence(value);
            const refStr = Symbols_1.Symbols.UI_ELEMENT_PREFIX + uipRef.content + Symbols_1.Symbols.UI_ELEMENT_SUFFIX;
            content = content.replace(refStr, formattedValue);
        }
        return content;
    }
}
exports.UIPropertyReferenceReplacer = UIPropertyReferenceReplacer;
