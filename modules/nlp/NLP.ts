import { Entities } from './Entities';
import { NLPTrainingData } from "./NLPTrainingData";
import { NLPResult } from './NLPResult';

import Bravey = require('../../lib/bravey'); // .js file

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

        // Add an entity named "value" and its recognizer
        this._additionalEntities.push( Entities.VALUE );
        this._additionalRecognizers.push( this.makeValueEntityRecognizer( Entities.VALUE ) );

        // Add an entity named "element" and its recognizer
        this._additionalEntities.push( Entities.UI_ELEMENT );
        this._additionalRecognizers.push( this.makeElementEntityRecognizer( Entities.UI_ELEMENT ) );
        
        // Add an entity named "number" and its recognizer
        this._additionalEntities.push( Entities.NUMBER );
        this._additionalRecognizers.push( this.makeNumberEntityRecognizer( Entities.NUMBER ) );

        // Add an entity named "query" and its recognizer
        this._additionalEntities.push( Entities.QUERY );
        this._additionalRecognizers.push( this.makeQueryEntityRecognizer( Entities.QUERY ) );

        // Add an entity named "constant" and its recognizer
        this._additionalEntities.push( Entities.CONSTANT );
        this._additionalRecognizers.push( this.makeConstantEntityRecognizer( Entities.CONSTANT ) );

        // Add an entity named "value_list" and its recognizer
        this._additionalEntities.push( Entities.VALUE_LIST );
        this._additionalRecognizers.push( this.makeValueListEntityRecognizer( Entities.VALUE_LIST ) );
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
                let entityRec = new Bravey.StringEntityRecognizer( e.name );
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
        return nlp.test( sentence, method );
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

    /**
     * Creates a recognizer for values between quotes.
     * 
     * Example: I fill "name" with "Bob"
     * --> The words "name" and "Bob" are recognized (without quotes).
     * 
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    private makeValueEntityRecognizer( entityName: string ): any {
        let valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        const regex = /"(?:[^"\\]|\\.)*"/g;
        valueRec.addMatch(
            regex,
            function( match ) {
                //console.log( 'match: ', match );
                const value = match[ 0 ] || '';
                return value.substring( 1, value.length - 1 ); // exclude quotes
            },
            100 // priority
        );
        return valueRec;
    }

    /**
     * Creates a recognizer for values between { and }.
     * 
     * Example: I fill {Name} with "Bob"
     * --> The word "Name" is recognized (without quotes).
     * 
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    private makeElementEntityRecognizer( entityName: string ): any {
        var valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        const regex = new RegExp( '\{[^<\r\n]*\}', "gi" );
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
     * Creates a recognizer for a number.
     * 
     * Example: I fill {Name} with -10.33
     * --> The value -10.33 is recognized.
     * 
     * @param entityName Entity name.
     * @return Bravey.EntityRecognizer
     */
    private makeNumberEntityRecognizer( entityName: string ): any {
        var valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        const regex = new RegExp( '(-?[0-9]+(?:.[0-9]+)?)', "gi" );
        valueRec.addMatch(
            regex,
            function( match ) {
                //console.log( 'match: ', match );
                return match[ 0 ].toString().trim();
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
    private makeQueryEntityRecognizer( entityName: string ): any {
        let valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        const regex = new RegExp( '"(?:\t| )*SELECT[^"]+"', "gi" );
        valueRec.addMatch(
            regex,
            function( match ) {
                //console.log( 'match: ', match );
                return match.toString().replace( /['"]+/g, '' ).trim();
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
     * 
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */    
    private makeConstantEntityRecognizer( entityName: string ): any {
        var valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        //const regex = /(?:\[)([^\$\]\d][^\$\]]+)(?:\])/g;
        const regex = /((?!\").{1}|^.{0,1})(?:\[)([^\$\]\d][^\$\]]+)(?:\])/g
        valueRec.addMatch(
            regex,
            function( match ) {
                //console.log( 'match: ', match, '\nvalue is', match[ 2 ] );
                //return match[ 0 ].toString().replace( '[', '' ).replace( ']', '' ).trim();
                return match[ 2 ].toString().trim();
            },
            500 // priority
        );
        return valueRec;
    }

    /**
     * Creates a recognizer for a list of values, in the format [ 1, "hello", 2, "hi \"Jane\"!" ]
     * 
     * @param entityName Entity name.
     * @returns Bravey.EntityRecognizer
     */
    private makeValueListEntityRecognizer( entityName: string ): any {
        var valueRec = new Bravey.RegexEntityRecognizer( entityName, 10 );
        const regex = /\[(?: )*((?:,) ?|([0-9]+(\.[0-9]+)?|\"(.*[^\\])\"))+(?: )*\]/g
        valueRec.addMatch(
            regex,
            function( match ) {
                //console.log( 'match: ', match );
                return match[ 0 ].toString().trim();
            },
            1000 // priority
        );
        return valueRec;
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