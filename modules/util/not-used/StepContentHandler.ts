import { Spec } from "../../ast/Spec";
import { Document } from '../../ast/Document';
import { NLPResult } from "../../nlp/NLPResult";
import { Entities } from "../../nlp/Entities";
import { isDefined } from "../TypeChecking";
import { Symbols } from "../../req/Symbols";
import { ValueTypeDetector } from "../ValueTypeDetector";
import { CaseType } from "../../app/CaseType";
import { convertCase } from "../CaseConversor";

export class StepContentHandler {


    replaceConstantsWithTheirValues(
        sentence: string,
        nlpResult: NLPResult,
        spec: Spec
    ): string {
        let newSentence: string = sentence;
        const valueTypeDetector = new ValueTypeDetector();
        for ( let e of nlpResult.entities || [] ) {

            if ( Entities.CONSTANT === e.entity ) {

                const valueContent: string | number = spec.constantNameToValueMap().get( e.value ) || '';

                const value: string = valueTypeDetector.isNumber( valueContent )
                    ? valueContent.toString() // e.g., 5
                    : Symbols.VALUE_WRAPPER + valueContent + Symbols.VALUE_WRAPPER; // e.g., "bar"

                // Replace
                newSentence = this.replaceAtPosition(
                    newSentence,
                    e.position,
                    Symbols.CONSTANT_PREFIX + e.value + Symbols.CONSTANT_SUFFIX,  // e.g., [bar]
                    value // e.g., "bar"
                );
            }
        }
        return newSentence;
    }


    replaceUIElementsWithUILiterals(
        sentence: string,
        nlpResult: NLPResult,
        doc: Document,
        spec: Spec,
        uiLiteralCaseOption: CaseType
    ): string {
        let newSentence: string = sentence;
        for ( let e of nlpResult.entities || [] ) {

            if ( Entities.UI_ELEMENT === e.entity ) {

                // Get the UI_LITERAL name by the UI_ELEMENT name
                const ui = spec.uiElementByVariable( e.value, doc );

                let literalName: string = isDefined( ui ) && isDefined( ui.info )
                    ? ui.info.uiLiteral
                    : convertCase( e.value, uiLiteralCaseOption ); // Uses the UI_ELEMENT name as the literal name, when it is not found.

                // Replace
                newSentence = this.replaceAtPosition(
                    newSentence,
                    e.position,
                    Symbols.UI_ELEMENT_PREFIX + e.value + Symbols.UI_ELEMENT_SUFFIX, // e.g., {Foo}
                    Symbols.UI_LITERAL_PREFIX + literalName + Symbols.UI_LITERAL_SUFFIX // e.g., <foo>
                );
            }
        }
        return newSentence;
    }


    private replaceAtPosition(
        sentence: string,
        position: number,
        from: string,
        to: string
    ): string {
        let pos = position;
        // --- Solves a Bravey problem on recognizing something with "["
        if ( sentence.charAt( pos ) !== Symbols.CONSTANT_PREFIX ) {
            if ( Symbols.CONSTANT_PREFIX === sentence.charAt( pos + 1 ) ) {
                pos++;
            } else if ( Symbols.CONSTANT_PREFIX === sentence.charAt( pos - 1 ) ) {
                pos--;
            }
        }
        // ---

        const before: string = sentence.substring( 0, pos );
        const after: string = sentence.substring( pos + from.length );
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