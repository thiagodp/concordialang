import Bravey = require('../../lib/bravey'); // .js file
import * as cloneRegExp from 'clone-regexp';

import { adjustValueToTheRightType } from '../util/ValueTypeDetector';
import {
    NLPResult,
    Entities,
    NLPTrainingData
} from "../nlp";

/**
 * Natural Language Processor
 *
 * @author Thiago Delgado Pinto
 */
export class NLP {

    private _nlpMap: any = {}; // Maps language => Bravey.NLP
    private _additionalEntities: string[] = [];
    private _additionalRecognizers: Object[] = [];

    constructor( private _useFuzzyProcessor: boolean = true ) {

        const erMaker = new EntityRecognizerMaker();

        // Add an entity named "value" and its recognizer
        this._additionalEntities.push( Entities.VALUE );
        this._additionalRecognizers.push( erMaker.makeValue( Entities.VALUE ) );

        // Add an entity named "ui_element" and its recognizer
        this._additionalEntities.push( Entities.UI_ELEMENT_REF );
        this._additionalRecognizers.push( erMaker.makeUIElementReference( Entities.UI_ELEMENT_REF ) );

        // Add an entity named "ui_property_ref" and its recognizer
        this._additionalEntities.push( Entities.UI_PROPERTY_REF );
        this._additionalRecognizers.push( erMaker.makeUIPropertyReference( Entities.UI_PROPERTY_REF ) );

        // Add an entity named "ui_element_literal" and its recognizer
        this._additionalEntities.push( Entities.UI_LITERAL );
        this._additionalRecognizers.push( erMaker.makeUILiteral( Entities.UI_LITERAL ) );

        // Add an entity named "number" and its recognizer
        this._additionalEntities.push( Entities.NUMBER );
        this._additionalRecognizers.push( erMaker.makeNumber( Entities.NUMBER ) );

        // Add an entity named "query" and its recognizer
        this._additionalEntities.push( Entities.QUERY );
        this._additionalRecognizers.push( erMaker.makeQuery( Entities.QUERY ) );

        // Add an entity named "constant" and its recognizer
        this._additionalEntities.push( Entities.CONSTANT );
        this._additionalRecognizers.push( erMaker.makeConstant( Entities.CONSTANT ) );

        // Add an entity named "value_list" and its recognizer
        this._additionalEntities.push( Entities.VALUE_LIST );
        this._additionalRecognizers.push( erMaker.makeValueList( Entities.VALUE_LIST ) );

        // Add an entity named "state" and its recognizer
        this._additionalEntities.push( Entities.STATE );
        this._additionalRecognizers.push( erMaker.makeState( Entities.STATE ) );

        // Add an entity named "command" and its recognizer
        this._additionalEntities.push( Entities.COMMAND );
        this._additionalRecognizers.push( erMaker.makeCommand( Entities.COMMAND ) );
    }

    /**
     * Train the recognizer.
     *
     * @param language Target language.
     * @param data Data to be used in the training.
     * @param intentNameFilter Filter for training only using certain intent. Optional. Default undefined.
     */
    public train( language: string, data: NLPTrainingData, intentNameFilter: string = undefined ): void {

        if ( ! this._nlpMap[ language ] ) {
            this._nlpMap[ language ] = { nlp: this.createNLP(), isTrained: true } as MappedNLP;
        } else {
            this._nlpMap[ language ].isTrained = true;
        }
        let nlp = this._nlpMap[ language ].nlp;

        // Add intents and their recognizers
        for ( let intent of data.intents ) {

            // Ignores the intent if it is equal to the filter (if defined)
            if ( intentNameFilter && intentNameFilter != intent.name ) {
                continue; // ignore the intent
            }

            let entities = intent.entities.map( e => { return { id: e.name, entity: e.name }; } );
            this.addDefaultEntitiesTo( entities );

            // Add the intent with its entities
            nlp.addIntent( intent.name, entities );

            // Add entity recognizers with matches. Each match have sample values, that
            // are added to the recognizer.
            for ( let e of intent.entities ) {
                let priority = undefined;
                if ( data.priorities && data.priorities[ intent.name ] && data.priorities[ intent.name ][ e.name ] ) {
                    priority = data.priorities[ intent.name ][ e.name ];
                }
                let entityRec = new Bravey.StringEntityRecognizer( e.name, priority );
                for ( let m of e.matches ) {
                    for ( let sample of m.samples ) {
                        entityRec.addMatch( m.id, sample );
                    }
                }
                nlp.addEntity( entityRec );
            }
        }

        // Add other needed recognizers
        this.addDefaultRecognizersTo( nlp );

        // Train with examples that include the added entities
        let opt = this.documentTrainingOptions();
        for ( let ex of data.examples ) {
            for ( let sentence of ex.sentences ) {
                nlp.addDocument( sentence, ex.intent, opt );
            }
        }
    }

    /**
     * Returns true if the NLP is trained for a certain language.
     *
     * @param language Language
     */
    public isTrained( language: string ): boolean {
        if ( ( ! this._nlpMap[ language ] ) ) {
            return false;
        }
        return this._nlpMap[ language ].isTrained;
    }

    /**
     * Recognizes a sentece.
     *
     * @param language Language to be used in the recognition.
     * @param sentence Sentence to be recognized.
     * @param entityFilter Filters the entity to be recognized. Defaults to '*' which means "all" .
     */
    public recognize( language: string, sentence: string, entityFilter: string = '*' ): NLPResult | null {
        let nlp;
        if ( ! this._nlpMap[ language ] ) {
            // Creates an untrained NLP
            this._nlpMap[ language ] = { nlp: this.createNLP(), isTrained: false } as MappedNLP;
        }
        nlp = this._nlpMap[ language ].nlp;
        let method = '*' == entityFilter || ! entityFilter ? 'anyEntity' : entityFilter; // | "default"
        let r = nlp.test( sentence, method );
        // console.log(
        //     'Sentence  :', sentence, "\n",
        //     'Recognized:', r.text
        // );
        return r;
    }

    private createNLP(): any {
        return this._useFuzzyProcessor ? new Bravey.Nlp.Fuzzy() : new Bravey.Nlp.Sequential()
    }

    private documentTrainingOptions(): Object {
        return { fromTaggedSentence: true, expandIntent: true };
    }

    /**
     * Adds default entities to the given entities array.
     *
     * @param entities Entities in which the default entities will be added.
     */
    private addDefaultEntitiesTo( entities: Object[] ): void {
        for ( let entityName of this._additionalEntities ) {
            entities.push( { id: entityName, entity: entityName } );
        }
    }

    /**
     * Add default recognizers to the given processor.
     * @param nlp Processor
     */
    private addDefaultRecognizersTo( nlp: any ): void {
        for ( let rec of this._additionalRecognizers ) {
            nlp.addEntity( rec );
        }
    }

}

/**
 * Mapped NLP
 *
 * @author Thiago Delgado Pinto
 */
interface MappedNLP {
    nlp: any;
    isTrained: boolean;
}

//
// REGEXES
//  - all of them have /g
//  - It is recommended to clone before using, because of lastIndex when using exec()
//

export const VALUE_REGEX = /"(?:[^"\\]|\\.)*"/g;
// export const UI_ELEMENT_REF_REGEX = new RegExp( '\{[a-zA-ZÀ-ÖØ-öø-ÿ][^|<\r\n\>\}]*\}', 'g' );
export const UI_ELEMENT_REF_REGEX = /\{[a-zA-ZÀ-ÖØ-öø-ÿ][^|<\r\n\>\}]*\}/g;
// export const UI_PROPERTY_REF_REGEX = new RegExp( '\\{[ ]*[a-zA-ZÀ-ÖØ-öø-ÿ]+[a-zA-ZÀ-ÖØ-öø-ÿ ]*\\:?[a-zA-ZÀ-ÖØ-öø-ÿ ]*\\|[a-zA-ZÀ-ÖØ-öø-ÿ ]+\\}', 'g' );
export const UI_PROPERTY_REF_REGEX = /\{[ ]*[a-zA-ZÀ-ÖØ-öø-ÿ][a-zA-ZÀ-ÖØ-öø-ÿ0-9 _-]*(\:[a-zA-ZÀ-ÖØ-öø-ÿ][a-zA-ZÀ-ÖØ-öø-ÿ0-9 _-]*)?\|[a-zA-ZÀ-ÖØ-öø-ÿ][a-zA-ZÀ-ÖØ-öø-ÿ ]+\}/g;
// export const UI_LITERAL_REGEX = /(?:\<)((?:#|@|\.|\/\/|~|[a-zA-ZÀ-ÖØ-öø-ÿ])[^<\r\n\>]*)(?:\>)/g;
// export const UI_LITERAL_REGEX = /(?:\<)((?:#|@|\.|\/\/|~|[a-zA-ZÀ-ÖØ-öø-ÿ])[^<\r\n]*)(?:\>)/g; // Issue #19
export const UI_LITERAL_REGEX = /(?:\<)((?:#|@|\.|\/\/|~|[a-zA-ZÀ-ÖØ-öø-ÿ0-9 ]?)[^<\r\n]*[^\\>])(?:\>)/g;
export const NUMBER_REGEX = /(-?[0-9]+(?:\.[0-9]+)?)/g;
// export const QUERY_REGEX = new RegExp( '"(?:\t| )*SELECT[^"]+"', "gi" );
export const QUERY_REGEX = /"(?:\t| )*SELECT[^"]+"/gi;
export const CONSTANT_REGEX = /\[[a-zA-ZÀ-ÖØ-öø-ÿ_][a-zA-ZÀ-ÖØ-öø-ÿ0-9 _-]*\]/g;
// export const VALUE_LIST_REGEX = /\[(?: )*((?:,) ?|([0-9]+(\.[0-9]+)?|\"(.*[^\\])\"))+(?: )*\]/g;
// export const VALUE_LIST_REGEX = /(\[[\t ]*([^\]])*[\t ]*[^\\]\])+/g; // only [ anything ]
// export const VALUE_LIST_REGEX = /(?:\[[\t ]*)(("[^"]*"|(-?[0-9]+(\.[0-9]+)?))*,?[\t ]?)+[^\]]?(?:\])/g; // [ value or number ]
export const VALUE_LIST_REGEX = /(?:\[[\t ]*)(("(\\"|[^"])+"|(-?[0-9]+(\.[0-9]+)?))+,?[\t ]?)+[^\]]?(?:\])/g; // [ value or number ]
export const STATE_REGEX = /\~[a-zA-ZÀ-ÖØ-öø-ÿ_][a-zA-ZÀ-ÖØ-öø-ÿ0-9 _-]*\~/g;
export const COMMAND_REGEX = /'(?:[^'\\]|\\.)*'/g;

/**
 * EntityRecognizer maker
 *
 * @author Thiago Delgado Pinto
 */
class EntityRecognizerMaker {

    /**
     * Creates a recognizer for values between quotes.
     *
     * Example: I fill "name" with "Bob"
     * --> The words "name" and "Bob" are recognized (without quotes).
     *
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    public makeValue( entityName: string ): any {
        let valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        let regex = cloneRegExp( VALUE_REGEX );
        valueRec.addMatch(
            regex,
            function( match ) {
                const value = match[ 0 ] || '';
                return value.substring( 1, value.length - 1 ); // exclude quotes
            },
            100 // priority
        );
        return valueRec;
    }

    /**
     * Creates a recognizer for references to UI Elements.
     *
     * Example 1: I fill {Name} with "Bob"
     *        --> The text "Name" is recognized (without quotes).
     *
     * Example 2: I fill {My Feature:Year} with "Bob"
     *        --> The text "My Feature:Year" is recognized (without quotes).
     *
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    public makeUIElementReference( entityName: string ): any {
        let valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        let regex = cloneRegExp( UI_ELEMENT_REF_REGEX );
        valueRec.addMatch(
            regex,
            function( match ) {
                //console.log( 'match: ', match );
                return match.toString().replace( '{', '' ).replace( '}', '' );
            },
            100 // priority
        );
        return valueRec;
    }

    /**
     * Creates a recognizer for references to UI Properties.
     *
     * Example 1: I fill {Foo} with {Name|value}
     *
     *  --> The ext "Name|value" is recognized (without quotes).
     *
     * Example 2: I fill {Foo} with {My Feature:Name|value}
     *
     *  --> The ext "My Feature:Name|value" is recognized (without quotes).
     *
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    public makeUIPropertyReference( entityName: string ): any {
        let valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        let regex = cloneRegExp( UI_PROPERTY_REF_REGEX );
        valueRec.addMatch(
            regex,
            function( match ) {
                const value = match[ 0 ] || '';
                return value.substring( 1, value.length - 1 ).trim(); // exclude { and } and trim
            },
            100 // priority
        );
        return valueRec;
    }

    /**
     * Creates a recognizer for values between < and >, with restrictions.
     *
     * Example: I fill <username> with "Bob"
     * --> The word "username" is recognized (without quotes).
     *
     * Supported formats: <id>, <#id>, <@name>, <.css>, <//xpath>, and <~mobilename>.
     *
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    public makeUILiteral( entityName: string ): any {
        let valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        let regex = cloneRegExp( UI_LITERAL_REGEX );
        valueRec.addMatch(
            regex,
            function( match ) {
                //console.log( 'match: ', match );
                return match[ 1 ].toString();
            },
            100 // priority
        );
        return valueRec;
    }

    /**
     * Creates a recognizer for a number.
     *
     * Example: I fill {Name} with -10.33
     * --> The value -10.33 is recognized.
     *
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    public makeNumber( entityName: string ): any {
        let valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        let regex = cloneRegExp( NUMBER_REGEX );
        valueRec.addMatch(
            regex,
            function( match ) {
                // console.log( 'match ', match );
                // return match[ 0 ].toString().trim();
                const value = match[ 0 ].toString().trim();
                return Number( value );
            },
            10 // priority
        );
        return valueRec;
    }

    /**
     * Creates a recognizer for values that start with select.
     *
     * Example: - value comes from the query "SELECT * FROM users"
     * --> The value "SELECT * FROM users" (without quotes) is recognized.
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    public makeQuery( entityName: string ): any {
        let valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        let regex = cloneRegExp( QUERY_REGEX );
        valueRec.addMatch(
            regex,
            function( match ) {
                // return match.toString().replace( /["]+/g, '' ).trim();
                const content = match.toString();
                return content.substring( 1, content.length - 1 ).trim();
            },
            200 // priority
        );
        return valueRec;
    }

    /**
     * Creates a recognizer for Constant references in the format [name].
     * A Constant name should not:
     * - be a number, e.g., [1] is invalid.
     * - have a dollar sign, e.g., [Foo$] is invalid.
     * - have spaces around, e.g., [ Foo ] is invalid.
     * - have quotes, e.g., [Foo"] is invalid.
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    public makeConstant( entityName: string ): any {
        let valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        let regex = cloneRegExp( CONSTANT_REGEX );
        valueRec.addMatch(
            regex,
            function( match ) {
                const value = match[ 0 ].toString();
                return value.substring( 1, value.length - 1 ); // exclude '[' and ']'
            },
            10 // priority
        );
        return valueRec;
    }

    /**
     * Creates a recognizer for a list of values, in the format [ 1, "hello", 2, "hi \"Jane\"!" ]
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    public makeValueList( entityName: string ): any {
        let valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        let regex = cloneRegExp( VALUE_LIST_REGEX );
        valueRec.addMatch(
            regex,
            function( match ) {
                // console.log( 'match: ', match );
                // return match[ 0 ].toString().trim();
                let content = match[ 0 ].toString().trim();
                content = content.substring( 1, content.length - 1 ); // Remove [ and ]

                const contentRegex = /(((-?[0-9]+(?:\.[0-9]+)?)|"(\\"|[^"])+"))+/g;
                let values: any[] = [];
                let result;
                while ( ( result = contentRegex.exec( content ) ) !== undefined ) {
                    if ( null === result ) {
                        break;
                    }
                    const v = result[ 0 ];
                    if ( v.startsWith( '"' ) ) {
                        values.push( v.substring( 1, v.length - 1 ) ); // Remove quotes
                    } else {
                        values.push( adjustValueToTheRightType( v ) );
                    }
                }

                // console.log( "VALUES:", values );
                return values;
            },
            1000 // priority
        );
        return valueRec;
    }


    /**
     * Creates a recognizer for State references in the format ~name~.
     * A State name should not:
     * - be a number, e.g., [1] is invalid.
     * - have a dollar sign, e.g., [Foo$] is invalid.
     * - have spaces around, e.g., [ Foo ] is invalid.
     * - have quotes, e.g., [Foo"] is invalid.
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    public makeState( entityName: string ): any {
        let valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        let regex = cloneRegExp( STATE_REGEX );
        valueRec.addMatch(
            regex,
            function( match ) {
                const value = match[ 0 ].toString();
                return value.substring( 1, value.length - 1 ); // exclude '~' and '~'
            },
            10 // priority
        );
        return valueRec;
    }

    /**
     * Creates a recognizer for values between single quotes
     *
     * Example: I run the command 'DELETE FROM users'
     * --> the value 'DELETE FROM users' (without single quotes) is recognized.
     *
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    public makeCommand( entityName: string ): any {
        let valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        let regex = cloneRegExp( COMMAND_REGEX );
        valueRec.addMatch(
            regex,
            function( match ) {
                const content = match.toString();
                return content.substring( 1, content.length - 1 ).trim();
            },
            500 // priority
        );
        return valueRec;
    }

}