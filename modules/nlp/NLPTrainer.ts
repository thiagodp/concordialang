import { NLPTrainingIntentExample, NLPTrainingData } from "./NLPTrainingData";
import { NLPTrainingDataConversor } from "./NLPTrainingDataConversor";
import { NLP } from "./NLP";
import { LanguageContentLoader } from "../dict/LanguageContentLoader";
import { LanguageContent } from "../dict/LanguageContent";
import { isDefined } from "../util/TypeChecking";

/**
 * NLP trainer.
 *
 * @author Thiago Delgado Pinto
 */
export class NLPTrainer {

    private _convertedData: Map< string, NLPTrainingData > =
        new Map< string, NLPTrainingData >();

    constructor(
        private _langLoader: LanguageContentLoader
    ) {
    }

    canBeTrained( language: string ): boolean {
        return this._langLoader.has( language );
    }

    trainNLP( nlp: NLP, language: string, internalNameFilter?: string ): boolean {

        if ( ! this.canBeTrained( language ) ) {
            return false;
        }

        let data: NLPTrainingData = this._convertedData[ language ];
        if ( ! data ) {
            let content: LanguageContent = this._langLoader.load( language );

            // Copy "ui_element_type" from "testcase" to "ui"
            if ( isDefined( content.nlp[ "testcase" ] )
                && isDefined( content.nlp[ "testcase" ][ "ui_element_type" ] )
                && isDefined( content.nlp[ "ui" ]
                && ! isDefined( content.nlp[ "ui" ][ "ui_element_type" ] )
            )
            ) {
                content.nlp[ "ui" ][ "ui_element_type" ] = content.nlp[ "testcase" ][ "ui_element_type" ];
            }


            let conversor: NLPTrainingDataConversor = new NLPTrainingDataConversor();
            data = conversor.convert( content.nlp || {}, content.training || [] );
            this._convertedData[ language ] = data;
        } else {
            data = this._convertedData[ language ];
        }

        nlp.train( language, data, internalNameFilter );
        return true;
    }

}