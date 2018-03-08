import { NLPTrainingIntentExample, NLPTrainingData } from "./NLPTrainingData";
import { NLPTrainingDataConversor } from "./NLPTrainingDataConversor";
import { NLP } from "./NLP";
import { LanguageContentLoader } from "../dict/LanguageContentLoader";
import { LanguageContent } from "../dict/LanguageContent";

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
            const content: LanguageContent = this._langLoader.load( language );
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