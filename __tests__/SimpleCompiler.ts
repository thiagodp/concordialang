import * as fs from 'fs';
import { resolve } from 'path';

import { DEFAULT_DIR_LANGUAGE, DEFAULT_ENCODING } from '../modules/app/default-options';
import { Document, FileInfo } from '../modules/ast';
import { SingleFileCompiler } from '../modules/compiler/SingleFileCompiler';
import { FileProblemMapper } from '../modules/error';
import { JsonLanguageContentLoader, LanguageContentLoader } from '../modules/language';
import { Lexer } from '../modules/lexer/Lexer';
import { NLPBasedSentenceRecognizer } from '../modules/nlp/NLPBasedSentenceRecognizer';
import { NLPTrainer } from '../modules/nlp/NLPTrainer';
import { Parser } from '../modules/parser/Parser';
import { AugmentedSpec } from '../modules/req/AugmentedSpec';
import { FSFileHandler } from '../modules/util/file/FSFileHandler';

/**
 * Useful for testing purposes.
 *
 * TO-DO: Refactor its content to use SingleFileCompiler
 */
export class SimpleCompiler {

    constructor( public language = 'pt' ) {
	}

	dir = resolve( process.cwd(), 'dist/' );

	langDir = resolve( this.dir, DEFAULT_DIR_LANGUAGE );

    fileHandler = new FSFileHandler( fs, DEFAULT_ENCODING );

    langLoader: LanguageContentLoader = new JsonLanguageContentLoader(
        this.langDir,
        {},
        this.fileHandler,
        this.fileHandler
        );

    lexer: Lexer = new Lexer( this.language, this.langLoader );

    parser = new Parser();

    nlpTrainer = new NLPTrainer( this.langLoader );
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
