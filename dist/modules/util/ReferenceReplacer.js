import { escape, escapeId } from 'sqlstring';
import { QueryParser } from '../db/QueryParser';
import { Entities } from '../nlp';
import { Symbols } from '../req/Symbols';
import { convertCase } from './CaseConversor';
import { TargetTypeUtil } from './TargetTypeUtil';
import { isDefined } from './TypeChecking';
import { ValueTypeDetector } from './ValueTypeDetector';
/**
 * Replaces references to Concordia constructions - such as named databases,
 * named tables, ui element names, and constants - with their corresponding values.
 *
 * @author Thiago Delgado Pinto
 */
export class ReferenceReplacer {
    // public replaceQuery(
    //     sentence: string,
    //     databaseNameToNameMap: Map< string, string >,
    //     tableNameToNameMap: Map< string, string >,
    //     uiElementNameToValueMap: Map< string, string | number >,
    //     constantNameToValueMap: Map< string, string | number >
    // ): string {
    //     return null;
    // }
    /**
     * Returns an array containing the replaced sentence and a comment.
     *
     * The comment has all the constant names (with their symbols), separated
     * by comma and space (", ").
     *
     * @param sentence
     * @param nlpResult
     * @param spec
     */
    replaceConstantsWithTheirValues(sentence, nlpResult, spec) {
        let newSentence = sentence;
        const valueTypeDetector = new ValueTypeDetector();
        let constants = [];
        for (let e of nlpResult.entities || []) {
            if (Entities.CONSTANT === e.entity) {
                let valueContent = spec.constantNameToValueMap().get(e.value);
                if (undefined === valueContent) {
                    valueContent = '';
                }
                const value = valueTypeDetector.isNumber(valueContent)
                    ? valueContent.toString() // e.g., 5
                    : Symbols.VALUE_WRAPPER + valueContent + Symbols.VALUE_WRAPPER; // e.g., "bar"
                // Replace
                newSentence = this.replaceConstantAtPosition(newSentence, e.position, Symbols.CONSTANT_PREFIX + e.value + Symbols.CONSTANT_SUFFIX, // e.g., [bar]
                value // e.g., "bar"
                );
                constants.push(Symbols.CONSTANT_PREFIX + e.value + Symbols.CONSTANT_SUFFIX);
            }
        }
        return [newSentence, constants.join(', ')];
    }
    /**
     * Returns an array containing the replaced sentence and a comment.
     *
     * The comment has all the UI Element variables (with their symbols),
     * separated by comma and space (", ").
     *
     * @param step
     * @param doc
     * @param spec
     * @param languageDictionary
     * @param uiLiteralCaseOption
     */
    replaceUIElementsWithUILiterals(step, hasInputAction, doc, spec, languageDictionary, uiLiteralCaseOption) {
        let sentence = step.content;
        let nlpResult = step.nlpResult;
        let newSentence = sentence;
        let uiElements = [];
        const targetTypeUtil = new TargetTypeUtil();
        for (let e of nlpResult.entities || []) {
            if (Entities.UI_ELEMENT_REF != e.entity) {
                continue;
            }
            // Get the UI_LITERAL name by the UI_ELEMENT name
            const ui = spec.uiElementByVariable(e.value, doc);
            let literalName = isDefined(ui) && isDefined(ui.info)
                ? ui.info.uiLiteral
                : convertCase(e.value, uiLiteralCaseOption); // Uses the UI_ELEMENT name as the literal name, when it is not found.
            const uiLiteral = Symbols.UI_LITERAL_PREFIX + literalName + Symbols.UI_LITERAL_SUFFIX;
            let targetType = '';
            if (!hasInputAction && !targetTypeUtil.hasInputTargetInTheSentence(step.content, languageDictionary)) {
                targetType = targetTypeUtil.analyzeInputTargetTypes(step, languageDictionary);
            }
            const prefixedUILiteral = targetType.length > 0 ? targetType + ' ' + uiLiteral : uiLiteral;
            // Replace
            // newSentence = this.replaceAtPosition(
            //     newSentence,
            //     e.position,
            //     Symbols.UI_ELEMENT_PREFIX + e.value + Symbols.UI_ELEMENT_SUFFIX, // e.g., {Foo}
            //     prefixedUILiteral // e.g., <foo>
            // );
            // E.g. {Foo} -> <foo>
            newSentence = newSentence.replace(Symbols.UI_ELEMENT_PREFIX + e.value + Symbols.UI_ELEMENT_SUFFIX, prefixedUILiteral);
            uiElements.push(Symbols.UI_ELEMENT_PREFIX + e.value + Symbols.UI_ELEMENT_SUFFIX);
        }
        return [newSentence, uiElements.join(', ')];
    }
    replaceConstantAtPosition(sentence, position, from, to) {
        let pos = position;
        // --- Solves a Bravey problem on recognizing something with "["
        if (sentence.charAt(pos) !== Symbols.CONSTANT_PREFIX) {
            if (Symbols.CONSTANT_PREFIX === sentence.charAt(pos + 1)) {
                pos++;
            }
            else if (Symbols.CONSTANT_PREFIX === sentence.charAt(pos - 1)) {
                pos--;
            }
        }
        // ---
        if (sentence.charAt(pos) !== Symbols.CONSTANT_PREFIX) {
            pos = sentence.indexOf(Symbols.CONSTANT_PREFIX, pos); // find starting at pos
        }
        return this.replaceAtPosition(sentence, pos, from, to);
    }
    replaceAtPosition(sentence, position, from, to) {
        const before = sentence.substring(0, position);
        const after = sentence.substring(position + from.length);
        // console.log(
        //     'sent :', sentence, "\n",
        //     'posit:', position, "\n",
        //     "from :", from, "\n",
        //     "to   :", to, "\n",
        //     'befor:', '|' + before + '|', "\n",
        //     'after:', '|' + after + '|', "\n",
        //     'resul:', before + to + after
        // );
        return before + to + after;
    }
    /**
     * Replaces references in a query.
     *
     * @param query Query.
     * @param databaseNameToNameMap
     * @param tableNameToNameMap
     * @param uiElementNameToValueMap
     * @param constantNameToValueMap
     * @returns A query with all the replacements.
     */
    replaceQuery(query, databaseNameToNameMap, tableNameToNameMap, uiElementNameToValueMap, constantNameToValueMap) {
        let varMap = {};
        // Wrap UI_ELEMENT names
        for (let [key, value] of uiElementNameToValueMap) {
            varMap[key] = this.wrapValue(value);
        }
        let constMap = {};
        // Wrap DATABASE names
        for (let [key, value] of databaseNameToNameMap) {
            constMap[key] = this.wrapName(value);
        }
        // Wrap TABLE names
        for (let [key, value] of tableNameToNameMap) {
            constMap[key] = this.wrapName(value);
        }
        // Wrap CONSTANT names
        for (let [key, value] of constantNameToValueMap) {
            constMap[key] = this.wrapValue(value);
        }
        return this.replaceAll(query, varMap, constMap);
    }
    replaceAll(sentence, varMap, constMap) {
        let s = sentence;
        for (let varName in varMap) {
            const regex = this.makeVarRegex(varName);
            const value = varMap[varName];
            s = s.replace(regex, value);
        }
        for (let constName in constMap) {
            const regex = this.makeNameRegex(constName);
            const value = constMap[constName];
            s = s.replace(regex, value);
        }
        return s;
    }
    wrapName(content) {
        return escapeId(content);
    }
    wrapValue(content) {
        return escape(content);
    }
    makeVarRegex(name) {
        return (new QueryParser()).makeVariableRegex(name);
    }
    makeNameRegex(name) {
        return (new QueryParser()).makeNameRegex(name);
    }
}
