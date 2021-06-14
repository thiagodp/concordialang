import { Document, FileInfo } from '../modules/ast';
import { SingleFileCompiler } from '../modules/compiler/SingleFileCompiler';
import { FileProblemMapper } from '../modules/error';
import languageMap from '../modules/language/data/map';
import { Lexer } from '../modules/lexer/Lexer';
import { NLPBasedSentenceRecognizer } from '../modules/nlp/NLPBasedSentenceRecognizer';
import { NLPTrainer } from '../modules/nlp/NLPTrainer';
import { Parser } from '../modules/parser/Parser';
import { AugmentedSpec } from '../modules/req/AugmentedSpec';

/**
 * Useful for testing purposes.
 *
 * TO-DO: Refactor its content to use SingleFileCompiler
 */
export class SimpleCompiler {

    constructor( public language = 'pt' ) {
	}

    lexer: Lexer = new Lexer( this.language, languageMap );

    parser = new Parser();

    nlpTrainer = new NLPTrainer( languageMap );
    nlpRec: NLPBasedSentenceRecognizer = new NLPBasedSentenceRecognizer( this.nlpTrainer );

    compiler = new SingleFileCompiler( this.lexer, this.parser, this.nlpRec, this.language );

    async addToSpec(
		spec: AugmentedSpec,
		lines: string[],
		fileInfo?: FileInfo
	): Promise< Document > {
        const doc = await this.compiler.processLines(
            new FileProblemMapper(), fileInfo ? fileInfo.path || '' : '', lines );
        spec.addDocument( doc );
        return doc;
    }

}
