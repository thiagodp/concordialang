import deepcopy from 'deepcopy';
import { dictionaryForLanguage } from '../language/data/map';
import { isDefined } from '../util/type-checking';
import { BASE_TRAINING_EXAMPLES } from './BaseTrainingExamples';
import { NLP_PRIORITIES } from './NLPTrainingData';
import { NLPTrainingDataConversor } from './NLPTrainingDataConversor';
/**
 * NLP trainer.
 *
 * @author Thiago Delgado Pinto
 */
export class NLPTrainer {
    constructor(_languageMap) {
        this._languageMap = _languageMap;
        this.LANGUAGE_INTENT_SEPARATOR = ':';
        this.ALL_INTENTS = '*';
        this._trainedIntents = [];
    }
    canBeTrained(language) {
        return !!this._languageMap[language];
    }
    isIntentTrained(language, intent) {
        return this._trainedIntents.indexOf(this.joinLanguageAndIntent(language, intent)) >= 0
            || this._trainedIntents.indexOf(this.joinLanguageAndIntent(language, this.ALL_INTENTS)) >= 0;
    }
    joinLanguageAndIntent(language, intent) {
        return (language + this.LANGUAGE_INTENT_SEPARATOR + (intent || this.ALL_INTENTS))
            .toLowerCase();
    }
    trainNLP(nlp, language, intentNameFilter) {
        if (!this.canBeTrained(language)) {
            return false;
        }
        if (this.isIntentTrained(language, intentNameFilter)) {
            return true;
        }
        let languageDictionary = deepcopy(dictionaryForLanguage(language));
        // Add base training sentences;
        if (isDefined(intentNameFilter)) {
            // console.log( 'INTENT DEFINED:', intentNameFilter );
            let example = languageDictionary.training.find(ex => ex.intent === intentNameFilter);
            const baseIntentExample = BASE_TRAINING_EXAMPLES.find(ex => ex.intent === intentNameFilter);
            if (isDefined(example) && isDefined(baseIntentExample)) {
                // console.log( intentNameFilter );
                // console.log( 'BEFORE' );
                // console.log( example.sentences.length );
                // Concat with base training sentences
                example.sentences = baseIntentExample.sentences.concat(example.sentences);
                // console.log( 'AFTER' );
                // console.log( example.sentences.length );
            }
        }
        else {
            // console.log( 'INTENT NOT DEFINED' );
            // Concat with base training sentences
            for (const baseEx of BASE_TRAINING_EXAMPLES) {
                if (this.isIntentTrained(language, baseEx.intent)) {
                    // console.log( '-> base intent already trained:', baseEx.intent );
                    continue;
                }
                // console.log( '-> base intent untrained:', baseEx.intent );
                let example = languageDictionary.training.find(ex => ex.intent === baseEx.intent);
                if (!example) {
                    continue;
                }
                // console.log( baseEx.intent );
                // console.log( 'BEFORE' );
                // console.log( example.sentences.length );
                example.sentences = baseEx.sentences.concat(example.sentences);
                // console.log( 'AFTER' );
                // console.log( example.sentences.length );
                this._trainedIntents.push(this.joinLanguageAndIntent(language, baseEx.intent));
            }
        }
        // COPY SOME PARTS TO OTHERS
        if (isDefined(languageDictionary.nlp["testcase"]) && isDefined(languageDictionary.nlp["ui"])) {
            // Copy "ui_element_type" from "testcase" to "ui"
            if (isDefined(languageDictionary.nlp["testcase"]["ui_element_type"])
                && !isDefined(languageDictionary.nlp["ui"]["ui_element_type"])) {
                languageDictionary.nlp["ui"]["ui_element_type"] = languageDictionary.nlp["testcase"]["ui_element_type"];
            }
            // Add items of "ui_property" from "ui" to "testcase"
            if (isDefined(languageDictionary.nlp["testcase"]["ui_property"])
                && !isDefined(languageDictionary.nlp["ui"]["ui_property"])) {
                const uiProperties = languageDictionary.nlp["ui"]["ui_property"];
                for (const p in uiProperties) {
                    languageDictionary.nlp["testcase"]["ui_property"][p] = languageDictionary.nlp["ui"]["ui_property"][p];
                }
            }
        }
        let conversor = new NLPTrainingDataConversor();
        let converted = conversor.convert(languageDictionary.nlp || {}, languageDictionary.training || []);
        converted.priorities = NLP_PRIORITIES;
        nlp.train(language, converted, intentNameFilter);
        return true;
    }
}
