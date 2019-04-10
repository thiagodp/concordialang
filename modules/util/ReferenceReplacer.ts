import { escape, escapeId } from 'sqlstring';
import { Document } from "concordialang-types";
import { Entities, NLPResult } from "concordialang-types";
import { CaseType } from '../app/CaseType';
import { AugmentedSpec } from '../ast/AugmentedSpec';
import { QueryParser } from '../db/QueryParser';
import { Symbols } from '../req/Symbols';
import { convertCase } from './CaseConversor';
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
    replaceConstantsWithTheirValues(
        sentence: string,
        nlpResult: NLPResult,
        spec: AugmentedSpec
    ): [ string, string ] {
        let newSentence: string = sentence;
        const valueTypeDetector = new ValueTypeDetector();
        let constants: string[] = [];
        for ( let e of nlpResult.entities || [] ) {

            if ( Entities.CONSTANT === e.entity ) {

                let valueContent: string | number = spec.constantNameToValueMap().get( e.value );
                if ( undefined === valueContent ) {
                    valueContent = '';
                }

                const value: string = valueTypeDetector.isNumber( valueContent )
                    ? valueContent.toString() // e.g., 5
                    : Symbols.VALUE_WRAPPER + valueContent + Symbols.VALUE_WRAPPER; // e.g., "bar"

                // Replace
                newSentence = this.replaceConstantAtPosition(
                    newSentence,
                    e.position,
                    Symbols.CONSTANT_PREFIX + e.value + Symbols.CONSTANT_SUFFIX,  // e.g., [bar]
                    value // e.g., "bar"
                );

                constants.push( Symbols.CONSTANT_PREFIX + e.value + Symbols.CONSTANT_SUFFIX );
            }
        }

        return [ newSentence, constants.join( ', ' ) ];
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
    replaceUIElementsWithUILiterals(
        sentence: string,
        nlpResult: NLPResult,
        doc: Document,
        spec: AugmentedSpec,
        uiLiteralCaseOption: CaseType
    ): [ string, string ] {
        let newSentence: string = sentence;
        let uiElements: string[] = [];
        for ( let e of nlpResult.entities || [] ) {

            if ( Entities.UI_ELEMENT != e.entity ) {
                continue;
            }

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

            uiElements.push( Symbols.UI_ELEMENT_PREFIX + e.value + Symbols.UI_ELEMENT_SUFFIX );
        }
        return [ newSentence, uiElements.join( ', ' ) ];
    }

    private replaceConstantAtPosition(
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

        if ( sentence.charAt( pos ) !== Symbols.CONSTANT_PREFIX ) {
            pos = sentence.indexOf( Symbols.CONSTANT_PREFIX, pos ); // find starting at pos
        }

        return this.replaceAtPosition( sentence, pos, from, to );
    }


    private replaceAtPosition(
        sentence: string,
        position: number,
        from: string,
        to: string
    ): string {
        const before: string = sentence.substring( 0, position );
        const after: string = sentence.substring( position + from.length );
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
    public replaceQuery(
        query: string,
        databaseNameToNameMap: Map< string, string >,
        tableNameToNameMap: Map< string, string >,
        uiElementNameToValueMap: Map< string, string | number >,
        constantNameToValueMap: Map< string, string | number >
    ): string {

        let varMap = {};

        // Wrap UI_ELEMENT names
        for ( let [ key, value ] of uiElementNameToValueMap ) {
            varMap[ key ] = this.wrapValue( value );
        }

        let constMap = {};

        // Wrap DATABASE names
        for ( let [ key, value ] of databaseNameToNameMap ) {
            constMap[ key ] = this.wrapName( value );
        }

        // Wrap TABLE names
        for ( let [ key, value ] of tableNameToNameMap ) {
            constMap[ key ] = this.wrapName( value );
        }

        // Wrap CONSTANT names
        for ( let [ key, value ] of constantNameToValueMap ) {
            constMap[ key ] = this.wrapValue( value );
        }

        return this.replaceAll( query, varMap, constMap );
    }


    private replaceAll( sentence: string, varMap: object, constMap: object ): string {
        let s = sentence;
        for ( let varName in varMap ) {
            const regex = this.makeVarRegex( varName );
            const value = varMap[ varName ];
            s = s.replace( regex, value );
        }
        for ( let constName in constMap ) {
            const regex = this.makeNameRegex( constName );
            const value = constMap[ constName ];
            s = s.replace( regex, value );
        }
        return s;
    }


    private wrapName( content: string ): string {
        return escapeId( content );
    }

    private wrapValue( content: string | number ): string | number {
        return escape( content );
    }

    private makeVarRegex( name: string ): RegExp {
        return ( new QueryParser() ).makeVariableRegex( name );
    }

    private makeNameRegex( name: string ): RegExp {
        return ( new QueryParser() ).makeNameRegex( name );
    }

}