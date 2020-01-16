import * as deepcopy from 'deepcopy';

import { LanguageContent, LanguageContentLoader } from '../dict';
import { isDefined } from '../util/TypeChecking';
import { NLP } from './NLP';
import { NLPTrainingData, NLP_PRIORITIES } from './NLPTrainingData';
import { NLPTrainingDataConversor } from './NLPTrainingDataConversor';
import { BASE_TRAINING_EXAMPLES } from './BaseTrainingExamples';

/**
 * NLP trainer.
 *
 * @author Thiago Delgado Pinto
 */
export class NLPTrainer {

    private readonly LANGUAGE_INTENT_SEPARATOR = ':';
    private readonly ALL_INTENTS = '*';

    private _trainedIntents: string[] = [];

    constructor(
        private _langLoader: LanguageContentLoader
    ) {
    }

    canBeTrained( language: string ): boolean {
        return this._langLoader.has( language );
    }

    isIntentTrained( language: string, intent: string ): boolean {
        return this._trainedIntents.indexOf( this.joinLanguageAndIntent( language, intent ) ) >= 0
            || this._trainedIntents.indexOf( this.joinLanguageAndIntent( language, this.ALL_INTENTS ) ) >= 0;
    }

    private joinLanguageAndIntent( language: string, intent: string ): string  {
        return  ( language + this.LANGUAGE_INTENT_SEPARATOR + ( intent || this.ALL_INTENTS ) )
            .toLowerCase();
    }

    trainNLP( nlp: NLP, language: string, intentNameFilter?: string ): boolean {

        if ( ! this.canBeTrained( language ) ) {
            return false;
        }

        if ( this.isIntentTrained( language, intentNameFilter ) ) {
            return true;
        }

        let content: LanguageContent = deepcopy( this._langLoader.load( language ) );

        // Add base training sentences;

        if ( isDefined( intentNameFilter ) ) {

            // console.log( 'INTENT DEFINED:', intentNameFilter );

            let example = content.training.find( ex => ex.intent === intentNameFilter );
            const baseIntentExample = BASE_TRAINING_EXAMPLES.find( ex => ex.intent === intentNameFilter );

            if ( isDefined( example ) && isDefined( baseIntentExample ) ) {

                // console.log( intentNameFilter );
                // console.log( 'BEFORE' );
                // console.log( example.sentences.length );

                // Concat with base training sentences
                example.sentences = baseIntentExample.sentences.concat( example.sentences );

                // console.log( 'AFTER' );
                // console.log( example.sentences.length );
            }

        } else {

            // console.log( 'INTENT NOT DEFINED' );

            // Concat with base training sentences
            for ( const baseEx of BASE_TRAINING_EXAMPLES ) {

                if ( this.isIntentTrained( language, baseEx.intent ) ) {
                    // console.log( '-> base intent already trained:', baseEx.intent );
                    continue;
                }
                // console.log( '-> base intent untrained:', baseEx.intent );

                let example = content.training.find( ex => ex.intent === baseEx.intent );
                if ( ! example ) {
                    continue;
                }

                // console.log( baseEx.intent );
                // console.log( 'BEFORE' );
                // console.log( example.sentences.length );

                example.sentences = baseEx.sentences.concat( example.sentences );

                // console.log( 'AFTER' );
                // console.log( example.sentences.length );

                this._trainedIntents.push( this.joinLanguageAndIntent( language, baseEx.intent ) );
            }
        }

        // COPY SOME PARTS TO OTHERS
        if ( isDefined( content.nlp[ "testcase" ] ) && isDefined( content.nlp[ "ui" ] ) ) {

            // Copy "ui_element_type" from "testcase" to "ui"
            if ( isDefined( content.nlp[ "testcase" ][ "ui_element_type" ] )
                && ! isDefined( content.nlp[ "ui" ][ "ui_element_type" ] ) ) {
                content.nlp[ "ui" ][ "ui_element_type" ] = content.nlp[ "testcase" ][ "ui_element_type" ];
            }

            // Add items of "ui_property" from "ui" to "testcase"
            if ( isDefined( content.nlp[ "testcase" ][ "ui_property" ] )
                && ! isDefined( content.nlp[ "ui" ][ "ui_property" ] ) ) {
                const uiProperties = content.nlp[ "ui" ][ "ui_property" ];
                for ( const p in uiProperties ) {
                    content.nlp[ "testcase" ][ "ui_property" ][ p ] = content.nlp[ "ui" ][ "ui_property" ][ p ];
                }
            }

        }

        let conversor: NLPTrainingDataConversor = new NLPTrainingDataConversor();
        let converted: NLPTrainingData = conversor.convert( content.nlp || {}, content.training || [] );
        converted.priorities = NLP_PRIORITIES;

        nlp.train( language, converted, intentNameFilter );

        return true;
    }

}