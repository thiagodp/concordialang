import { QueryParser } from '../db/QueryParser';
import { escapeId, escape } from 'sqlstring';
import { isNumber } from './TypeChecking';
import { Entities } from '../nlp/Entities';
import { LocatedException } from '../req/LocatedException';
import { Warning } from '../req/Warning';
import { CaseType } from '../app/CaseType';
import { convertCase } from './CaseConversor';
import { Symbols } from '../req/Symbols';
import { NLPResult } from '../nlp/NLPResult';
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
     * Replace references in a test case sentence.
     * 
     * @param sentence Sentence to replace.
     * @param nlpResult Result of the NLP.
     * @param uiElementNameToLiteralMap Map from UI_ELEMENT names to UI_LITERAL ids
     * @param constantNameToValueMap Map from CONSTANT to their VALUEs
     * @param caseOption String case option to use a UI_ELEMENT name as a UI_LITERAL id when the former is not found in the map.
     */
    public replaceTestCaseSentence(
        sentence: string,
        nlpResult: NLPResult,
        uiElementNameToLiteralMap: Map< string, string >,
        constantNameToValueMap: Map< string, string | number >,
        caseOption: CaseType | string
    ): string {

        let newSentence: string = sentence;

        for ( let e of nlpResult.entities ) {

            // Replace UI_ELEMENT with UI_LITERAL
            if ( Entities.UI_ELEMENT === e.entity ) {

                // Get the UI_LITERAL name by the UI_ELEMENT name
                let literalName: string = uiElementNameToLiteralMap.get( e.value );
                // Uses the UI_ELEMENT name as the literal name, when it is not found.
                if ( ! literalName ) {
                    literalName = convertCase( e.value, caseOption );
                }

                // Replace
                newSentence = this.replaceAtPosition(
                    newSentence,
                    e.position,
                    Symbols.UI_ELEMENT_PREFIX + e.value + Symbols.UI_ELEMENT_SUFFIX, // e.g., {Foo}
                    Symbols.UI_LITERAL_PREFIX + literalName + Symbols.UI_LITERAL_SUFFIX // e.g., <foo>
                );

            // Replace CONSTANT with VALUE                
            } else if ( Entities.CONSTANT === e.entity ) {

                const valueContent: string | number = constantNameToValueMap.get( e.value ) || '';

                const value: string = ( new ValueTypeDetector() ).isNumber( valueContent )
                    ? valueContent.toString() // e.g., 5
                    : Symbols.VALUE_WRAPPER + valueContent + Symbols.VALUE_WRAPPER; // e.g., "text"

                // Replace
                newSentence = this.replaceAtPosition(
                    newSentence,
                    e.position,
                    Symbols.CONSTANT_PREFIX + e.value + Symbols.CONSTANT_SUFFIX,  // e.g., [bar]
                    value
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