import { NLPEntityUsageExample, NLPTrainingData } from "./NLPTrainingData";
import { NLPTrainingDataConversor } from "./NLPTrainingDataConversor";
import { NLP } from "./NLP";

/**
 * NLP helper
 * 
 * @author Thiago Delgado Pinto
 */
export class NLPBuilder {

    constructor( private _dataDir = '../../data/' ) {
    }

    buildTrainedNLP( language: string = 'en' ): NLP {
        let translationMap = this.makeTranslationMap( language );
        let examples = this.makeTrainingExamples( language );
        let conversor: NLPTrainingDataConversor = new NLPTrainingDataConversor();
        let data: NLPTrainingData = conversor.convert( translationMap, examples );
        let nlp = new NLP();
        nlp.train( language, data );
        return nlp;
    }

    makeTranslationMap( language: string = 'en' ): any {
        return require( this._dataDir + `nlp/${language}.json` );
    }

    makeTrainingExamples( language: string = 'en' ): NLPEntityUsageExample[] {
        return require( this._dataDir + `training/${language}.json` );
    }    

}