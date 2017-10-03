import { NLPEntityUsageExample, NLPTrainingData } from "../../modules/nlp/NLPTrainingData";
import { NLPTrainingDataConversor } from "../../modules/nlp/NLPTrainingDataConversor";
import { NLP } from "../../modules/nlp/NLP";

/**
 * NLP helper
 * 
 * @author Thiago Delgado Pinto
 */
export class NLPHelper {

    buildTrainedNLP( language: string = 'en' ): NLP {
        let translationMap = this.makeTranslationMap( language );
        let examples = this.makeTrainingExamples( language );
        let conversor: NLPTrainingDataConversor = new NLPTrainingDataConversor();
        let data: NLPTrainingData = conversor.convert( translationMap, examples );
        let nlp = new NLP();
        nlp.train( data );
        return nlp;
    }

    makeTranslationMap( language: string = 'en' ): any {
        return require( `../../data/nlp/${language}.json` );
    }

    makeTrainingExamples( language: string = 'en' ): NLPEntityUsageExample[] {
        return require( `../../data/training/${language}.json` );
    }    

}