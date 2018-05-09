"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Entities_1 = require("../../nlp/Entities");
const TypeChecking_1 = require("../TypeChecking");
const Symbols_1 = require("../../req/Symbols");
const ValueTypeDetector_1 = require("../ValueTypeDetector");
const CaseConversor_1 = require("../CaseConversor");
class StepContentHandler {
    replaceConstantsWithTheirValues(sentence, nlpResult, spec) {
        let newSentence = sentence;
        const valueTypeDetector = new ValueTypeDetector_1.ValueTypeDetector();
        for (let e of nlpResult.entities || []) {
            if (Entities_1.Entities.CONSTANT === e.entity) {
                const valueContent = spec.constantNameToValueMap().get(e.value) || '';
                const value = valueTypeDetector.isNumber(valueContent)
                    ? valueContent.toString() // e.g., 5
                    : Symbols_1.Symbols.VALUE_WRAPPER + valueContent + Symbols_1.Symbols.VALUE_WRAPPER; // e.g., "bar"
                // Replace
                newSentence = this.replaceAtPosition(newSentence, e.position, Symbols_1.Symbols.CONSTANT_PREFIX + e.value + Symbols_1.Symbols.CONSTANT_SUFFIX, // e.g., [bar]
                value // e.g., "bar"
                );
            }
        }
        return newSentence;
    }
    replaceUIElementsWithUILiterals(sentence, nlpResult, doc, spec, uiLiteralCaseOption) {
        let newSentence = sentence;
        for (let e of nlpResult.entities || []) {
            if (Entities_1.Entities.UI_ELEMENT === e.entity) {
                // Get the UI_LITERAL name by the UI_ELEMENT name
                const ui = spec.uiElementByVariable(e.value, doc);
                let literalName = TypeChecking_1.isDefined(ui) && TypeChecking_1.isDefined(ui.info)
                    ? ui.info.uiLiteral
                    : CaseConversor_1.convertCase(e.value, uiLiteralCaseOption); // Uses the UI_ELEMENT name as the literal name, when it is not found.
                // Replace
                newSentence = this.replaceAtPosition(newSentence, e.position, Symbols_1.Symbols.UI_ELEMENT_PREFIX + e.value + Symbols_1.Symbols.UI_ELEMENT_SUFFIX, // e.g., {Foo}
                Symbols_1.Symbols.UI_LITERAL_PREFIX + literalName + Symbols_1.Symbols.UI_LITERAL_SUFFIX // e.g., <foo>
                );
            }
        }
        return newSentence;
    }
    replaceAtPosition(sentence, position, from, to) {
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
        const before = sentence.substring(0, pos);
        const after = sentence.substring(pos + from.length);
        // console.log(
        //     'sent :', sentence, "\n",
        //     'posit:', position, "\n",
        //     'pos  :', pos, "\n",
        //     "from :", from, "\n",
        //     "to   :", to, "\n",
        //     'befor:', '|' + before + '|', "\n",
        //     'after:', '|' + after + '|', "\n",
        //     'resul:', before + to + after
        // );
        return before + to + after;
    }
}
exports.StepContentHandler = StepContentHandler;
//# sourceMappingURL=StepContentHandler.js.map