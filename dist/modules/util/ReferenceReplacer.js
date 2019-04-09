"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sqlstring_1 = require("sqlstring");
const nlp_1 = require("concordialang-types/nlp");
const QueryParser_1 = require("../db/QueryParser");
const Symbols_1 = require("../req/Symbols");
const CaseConversor_1 = require("./CaseConversor");
const TypeChecking_1 = require("./TypeChecking");
const ValueTypeDetector_1 = require("./ValueTypeDetector");
/**
 * Replaces references to Concordia constructions - such as named databases,
 * named tables, ui element names, and constants - with their corresponding values.
 *
 * @author Thiago Delgado Pinto
 */
class ReferenceReplacer {
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
        const valueTypeDetector = new ValueTypeDetector_1.ValueTypeDetector();
        let constants = [];
        for (let e of nlpResult.entities || []) {
            if (nlp_1.Entities.CONSTANT === e.entity) {
                let valueContent = spec.constantNameToValueMap().get(e.value);
                if (undefined === valueContent) {
                    valueContent = '';
                }
                const value = valueTypeDetector.isNumber(valueContent)
                    ? valueContent.toString() // e.g., 5
                    : Symbols_1.Symbols.VALUE_WRAPPER + valueContent + Symbols_1.Symbols.VALUE_WRAPPER; // e.g., "bar"
                // Replace
                newSentence = this.replaceConstantAtPosition(newSentence, e.position, Symbols_1.Symbols.CONSTANT_PREFIX + e.value + Symbols_1.Symbols.CONSTANT_SUFFIX, // e.g., [bar]
                value // e.g., "bar"
                );
                constants.push(Symbols_1.Symbols.CONSTANT_PREFIX + e.value + Symbols_1.Symbols.CONSTANT_SUFFIX);
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
     * @param sentence
     * @param nlpResult
     * @param doc
     * @param spec
     * @param uiLiteralCaseOption
     */
    replaceUIElementsWithUILiterals(sentence, nlpResult, doc, spec, uiLiteralCaseOption) {
        let newSentence = sentence;
        let uiElements = [];
        for (let e of nlpResult.entities || []) {
            if (nlp_1.Entities.UI_ELEMENT != e.entity) {
                continue;
            }
            // Get the UI_LITERAL name by the UI_ELEMENT name
            const ui = spec.uiElementByVariable(e.value, doc);
            let literalName = TypeChecking_1.isDefined(ui) && TypeChecking_1.isDefined(ui.info)
                ? ui.info.uiLiteral
                : CaseConversor_1.convertCase(e.value, uiLiteralCaseOption); // Uses the UI_ELEMENT name as the literal name, when it is not found.
            // Replace
            newSentence = this.replaceAtPosition(newSentence, e.position, Symbols_1.Symbols.UI_ELEMENT_PREFIX + e.value + Symbols_1.Symbols.UI_ELEMENT_SUFFIX, // e.g., {Foo}
            Symbols_1.Symbols.UI_LITERAL_PREFIX + literalName + Symbols_1.Symbols.UI_LITERAL_SUFFIX // e.g., <foo>
            );
            uiElements.push(Symbols_1.Symbols.UI_ELEMENT_PREFIX + e.value + Symbols_1.Symbols.UI_ELEMENT_SUFFIX);
        }
        return [newSentence, uiElements.join(', ')];
    }
    replaceConstantAtPosition(sentence, position, from, to) {
        let pos = position;
        // --- Solves a Bravey problem on recognizing something with "["
        if (sentence.charAt(pos) !== Symbols_1.Symbols.CONSTANT_PREFIX) {
            if (Symbols_1.Symbols.CONSTANT_PREFIX === sentence.charAt(pos + 1)) {
                pos++;
            }
            else if (Symbols_1.Symbols.CONSTANT_PREFIX === sentence.charAt(pos - 1)) {
                pos--;
            }
        }
        // ---
        if (sentence.charAt(pos) !== Symbols_1.Symbols.CONSTANT_PREFIX) {
            pos = sentence.indexOf(Symbols_1.Symbols.CONSTANT_PREFIX, pos); // find starting at pos
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
        return sqlstring_1.escapeId(content);
    }
    wrapValue(content) {
        return sqlstring_1.escape(content);
    }
    makeVarRegex(name) {
        return (new QueryParser_1.QueryParser()).makeVariableRegex(name);
    }
    makeNameRegex(name) {
        return (new QueryParser_1.QueryParser()).makeNameRegex(name);
    }
}
exports.ReferenceReplacer = ReferenceReplacer;
