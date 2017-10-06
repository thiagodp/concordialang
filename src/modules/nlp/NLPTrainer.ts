import { InputFileExtractor } from '../util/InputFileExtractor';
import { NLPEntityUsageExample, NLPTrainingData } from "./NLPTrainingData";
import { NLPTrainingDataConversor } from "./NLPTrainingDataConversor";
import { NLP } from "./NLP";

import path = require( 'path' );

/**
 * NLP trainer.
 * 
 * @author Thiago Delgado Pinto
 */
export class NLPTrainer {

    private _fileUtil = new InputFileExtractor();

    constructor( private _dataDir = path.join( process.cwd(), 'data/' ) ) {
    }

    dataDir( dir?: string ) {
        if ( dir ) {
            this._dataDir = dir;
        }
        return this._dataDir;
    }

    canBeTrained( language: string ): boolean {
        return this._fileUtil.fileExist( this.nlpPath( language ) )
            && this._fileUtil.fileExist( this.trainingPath( language ) );
    }

    trainNLP( nlp: any, language: string ): boolean {

        if ( ! this.canBeTrained( language ) ) {
            return false;
        }

        let translationMap = this.makeTranslationMap( language );
        let examples = this.makeTrainingExamples( language );
        let conversor: NLPTrainingDataConversor = new NLPTrainingDataConversor();
        let data: NLPTrainingData = conversor.convert( translationMap, examples );
        nlp.train( language, data );
        return true;
    }

    makeTranslationMap( language: string = 'en' ): any {
        return require( this.nlpPath( language ) );
    }

    makeTrainingExamples( language: string = 'en' ): NLPEntityUsageExample[] {
        return require( this.trainingPath( language ) );
    }

    nlpPath( language: string ): string {
        return this._dataDir + `nlp/${language}.json`;
    }

    trainingPath( language: string ): string {
        return this._dataDir + `training/${language}.json`
    }

}