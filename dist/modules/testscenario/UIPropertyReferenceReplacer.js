"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIPropertyReferenceReplacer = void 0;
const path_1 = require("path");
const ast_1 = require("../ast");
const Warning_1 = require("../error/Warning");
const Symbols_1 = require("../req/Symbols");
const util_1 = require("../util");
const remove_duplicated_1 = require("../util/remove-duplicated");
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
     * @param localeContext Locale context.
     * @param step Input step.
     * @param content Input content.
     * @param uiePropertyReferences References to replace.
     * @param uieVariableToValueMap Map that contains the value of all UIElement variables.
     * @param ctx Generation context.
     * @param isAlreadyInsideAString Indicates if the value is already inside a string. Optional, defaults to `false`.
     */
    replaceUIPropertyReferencesByTheirValue(localeContext, step, content, uiePropertyReferences, uieVariableToValueMap, ctx, isAlreadyInsideAString = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const uieNameHandler = new util_1.UIElementNameHandler();
            const propExtractor = new util_1.UIElementPropertyExtractor();
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
                    const err = new Warning_1.Warning(msg);
                    ctx.warnings.push(err);
                    continue;
                }
                const uieName = uipRef.uiElementName;
                const [featureName,] = uieNameHandler.extractNamesOf(uieName);
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
                    const err = new Warning_1.Warning(msg);
                    ctx.warnings.push(err);
                    value = '';
                }
                const propertyMap = propExtractor.mapFirstPropertyOfEachType(uie);
                const valueType = propExtractor.guessDataType(propertyMap);
                const uieLocale = propExtractor.extractLocale(uie) || localeContext.language;
                const uieLocaleFormat = propExtractor.extractLocaleFormat(uie);
                const uieLocaleContext = localeContext.clone()
                    .withLocale(uieLocale)
                    .withLocaleFormat(uieLocaleFormat);
                const formattedValue = yield value_formatter_1.formatValueToUseInASentence(valueType, uieLocaleContext, value, isAlreadyInsideAString);
                const refStr = Symbols_1.Symbols.UI_ELEMENT_PREFIX + uipRef.content + Symbols_1.Symbols.UI_ELEMENT_SUFFIX;
                newContent = newContent.replace(refStr, formattedValue);
            }
            remove_duplicated_1.removeDuplicated(ctx.warnings, (a, b) => a.message == b.message);
            return newContent;
        });
    }
}
exports.UIPropertyReferenceReplacer = UIPropertyReferenceReplacer;
