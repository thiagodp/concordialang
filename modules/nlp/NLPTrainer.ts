import deepcopy from 'deepcopy';

import { dictionaryForLanguage, LanguageMap } from '../language/data/map';
import { LanguageDictionary } from '../language/LanguageDictionary';
import { isDefined } from '../util/TypeChecking';
import { BASE_TRAINING_EXAMPLES } from './BaseTrainingExamples';
import { NLP } from './NLP';
import { NLP_PRIORITIES, NLPTrainingData } from './NLPTrainingData';
import { NLPTrainingDataConversor } from './NLPTrainingDataConversor';

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
        private _languageMap: LanguageMap
    ) {
    }

    canBeTrained( language: string ): boolean {
        return !! this._languageMap[ language ];
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

        let languageDictionary: LanguageDictionary = deepcopy( dictionaryForLanguage( language ) );

        // Add base training sentences;

        if ( isDefined( intentNameFilter ) ) {

            // console.log( 'INTENT DEFINED:', intentNameFilter );

            let example = languageDictionary.training.find( ex => ex.intent === intentNameFilter );
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

                let example = languageDictionary.training.find( ex => ex.intent === baseEx.intent );
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
        if ( isDefined( languageDictionary.nlp[ "testcase" ] ) && isDefined( languageDictionary.nlp[ "ui" ] ) ) {

            // Copy "ui_element_type" from "testcase" to "ui"
            if ( isDefined( languageDictionary.nlp[ "testcase" ][ "ui_element_type" ] )
                && ! isDefined( languageDictionary.nlp[ "ui" ][ "ui_element_type" ] ) ) {
                languageDictionary.nlp[ "ui" ][ "ui_element_type" ] = languageDictionary.nlp[ "testcase" ][ "ui_element_type" ];
            }

            // Add items of "ui_property" from "ui" to "testcase"
            if ( isDefined( languageDictionary.nlp[ "testcase" ][ "ui_property" ] )
                && ! isDefined( languageDictionary.nlp[ "ui" ][ "ui_property" ] ) ) {
                const uiProperties = languageDictionary.nlp[ "ui" ][ "ui_property" ];
                for ( const p in uiProperties ) {
                    languageDictionary.nlp[ "testcase" ][ "ui_property" ][ p ] = languageDictionary.nlp[ "ui" ][ "ui_property" ][ p ];
                }
            }

        }

        let conversor: NLPTrainingDataConversor = new NLPTrainingDataConversor();
        let converted: NLPTrainingData = conversor.convert( languageDictionary.nlp || {}, languageDictionary.training || [] );
        converted.priorities = NLP_PRIORITIES;

        nlp.train( language, converted, intentNameFilter );

        return true;
    }

}