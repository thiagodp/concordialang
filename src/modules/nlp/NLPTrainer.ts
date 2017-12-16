import { FileUtil } from '../util/FileUtil';
import { NLPIntentExample, NLPTrainingData } from "./NLPTrainingData";
import { NLPTrainingDataConversor } from "./NLPTrainingDataConversor";
import { NLP } from "./NLP";

import path = require( 'path' );

/**
 * NLP trainer.
 * 
 * @author Thiago Delgado Pinto
 */
export class NLPTrainer {

    private _fileUtil = new FileUtil();
    private _dataCacheMap: object = {}; // Maps language => data

    constructor( private _dataDir = path.join( process.cwd(), 'data/' ) ) {
    }

    dataDir( dir?: string ) {
        if ( dir ) {
            this._dataDir = dir;
        }
        return this._dataDir;
    }

    canBeTrained( language: string ): boolean {

        // Already trained -> can be trained ;)
        if ( this._dataCacheMap[ language ] ) {
            return true;
        }

        return this._fileUtil.fileExist( this.nlpPath( language ) )
            && this._fileUtil.fileExist( this.trainingPath( language ) );
    }

    trainNLP( nlp: NLP, language: string, internalNameFilter?: string ): boolean {

        if ( ! this.canBeTrained( language ) ) {
            return false;
        }

        let data: NLPTrainingData = this._dataCacheMap[ language ];
        if ( ! data ) {
            let translationMap = this.makeTranslationMap( language );
            let examples = this.makeTrainingExamples( language );
            let conversor: NLPTrainingDataConversor = new NLPTrainingDataConversor();
            data = conversor.convert( translationMap, examples );
            this._dataCacheMap[ language ] = data;
        } else {
            data = this._dataCacheMap[ language ];
        }

        nlp.train( language, data, internalNameFilter );
        return true;
    }

    makeTranslationMap( language: string ): any {
        return require( this.nlpPath( language ) );
    }

    makeTrainingExamples( language: string ): NLPIntentExample[] {
        return require( this.trainingPath( language ) );
    }

    nlpPath( language: string ): string {
        return this._dataDir + `nlp/${language}.json`;
    }

    trainingPath( language: string ): string {
        return this._dataDir + `training/${language}.json`
    }

}