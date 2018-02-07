import { NLPIntentExample, NLPTrainingData } from "./NLPTrainingData";
import { NLPTrainingDataConversor } from "./NLPTrainingDataConversor";
import { NLP } from "./NLP";
import * as fs from 'fs';
import { resolve } from 'path';

/**
 * NLP trainer.
 * 
 * @author Thiago Delgado Pinto
 */
export class NLPTrainer {

    private _dataCacheMap: object = {}; // Maps language => data

    constructor(
        private _nlpDir: string,
        private _trainingDir: string,
        private _fs = fs
    ) {
    }

    canBeTrained( language: string ): boolean {

        // Already trained -> can be trained ;)
        if ( this._dataCacheMap[ language ] ) {
            return true;
        }

        return this._fs.existsSync( this.nlpPath( language ) )
            && this._fs.existsSync( this.trainingPath( language )  );
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
        return resolve( this._nlpDir, `${language}.json` );
    }

    trainingPath( language: string ): string {
        return resolve( this._trainingDir, `${language}.json` );
    }

}